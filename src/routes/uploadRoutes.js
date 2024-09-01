// src/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { pool, updateImageUrl } = require('../db'); // Import the pool and updateImageUrl function

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('file');

// Endpoint to upload CSV and process images
router.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('File upload error:', err);
            return res.status(500).json({ message: 'File upload error' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const requestId = uuidv4(); // Generate a unique request ID

        let validHeaders = false;
        const products = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('headers', (headers) => {
                validHeaders = headers.includes('S. No.') && headers.includes('Product Name') && headers.includes('Input Image Urls');
            })
            .on('data', (row) => {
                if (validHeaders) {
                    products.push({
                        requestId: requestId,
                        serialNumber: row['S. No.'],
                        productName: row['Product Name'],
                        inputImageUrls: row['Input Image Urls'],
                        outputImageUrls: '' // Initially empty
                    });
                }
            })
            .on('end', async () => {
                if (!validHeaders) {
                    return res.status(400).json({ message: 'Invalid CSV headers' });
                }

                try {
                    // Insert request info into the database
                    await pool.query('INSERT INTO requests (id, status) VALUES (?, ?)', [requestId, 'Processing']);

                    // Insert product data into the database
                    for (const product of products) {
                        await pool.query(
                            'INSERT INTO products (request_id, serial_number, product_name, input_image_urls, output_image_urls) VALUES (?, ?, ?, ?, ?)',
                            [product.requestId, product.serialNumber, product.productName, product.inputImageUrls, product.outputImageUrls]
                        );
                    }

                    res.status(200).json({ message: 'File uploaded and data saved successfully', requestId: requestId });

                } catch (error) {
                    console.error('Database error:', error);
                    res.status(500).json({ message: 'Error inserting data into the database', error: error.message });
                }
            })
            .on('error', (error) => {
                console.error('CSV parsing error:', error);
                res.status(500).json({ message: 'Error reading the CSV file' });
            });
    });
});

// Endpoint to get status of a request
router.get('/status/:request_id', async (req, res) => {
    const requestId = req.params.request_id;

    // Queries to get status and product details
    const getRequestStatusQuery = 'SELECT id, status FROM requests WHERE id = ?';
    const getProductsDetailsQuery = 'SELECT serial_number, product_name, input_image_urls, output_image_urls FROM products WHERE request_id = ?';

    try {
        // Get request status
        const [requestRows] = await pool.query(getRequestStatusQuery, [requestId]);
        
        if (requestRows.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const requestStatus = requestRows[0];

        // Get product details
        const [productRows] = await pool.query(getProductsDetailsQuery, [requestId]);

        res.status(200).json({
            requestId: requestStatus.id,
            status: requestStatus.status,
            products: productRows
        });
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ message: 'Error retrieving status', error: error.message });
    }
});

module.exports = router;
