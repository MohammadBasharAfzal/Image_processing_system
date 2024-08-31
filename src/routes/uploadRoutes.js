// src/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const connection = require('../db'); // Import the database connection

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('file');

router.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: 'File upload error' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const requestId = uuidv4(); // Generate a unique request ID

        // Validate CSV file headers and parse data
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

                // Insert request info into the database
                connection.query('INSERT INTO requests (id, status) VALUES (?, ?)', [requestId, 'Processing'], (err) => {
                    if (err) return res.status(500).json({ message: 'Error inserting request' });

                    // Insert product data into the database
                    products.forEach((product) => {
                        connection.query(
                            'INSERT INTO products (request_id, serial_number, product_name, input_image_urls, output_image_urls) VALUES (?, ?, ?, ?, ?)',
                            [product.requestId, product.serialNumber, product.productName, product.inputImageUrls, product.outputImageUrls],
                            (err) => {
                                if (err) return res.status(500).json({ message: 'Error inserting product data' });
                            }
                        );
                    });

                    res.status(200).json({ message: 'File uploaded and data saved successfully', requestId: requestId });
                });
            })
            .on('error', (error) => {
                res.status(500).json({ message: 'Error reading the CSV file' });
            });
    });
});

module.exports = router;
