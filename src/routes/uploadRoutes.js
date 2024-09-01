const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { updateImageUrl } = require('../db'); // Import the updateImageUrl function

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/uploads'); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('file');

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
                    await new Promise((resolve, reject) => {
                        // Insert request information as needed
                        resolve(); // Modify this as needed
                    });

                    // Update product data in the database
                    await Promise.all(products.map((product) => {
                        return updateImageUrl(product.serialNumber, product.outputImageUrls) // Assuming `serialNumber` matches `id` in products table
                            .catch((err) => {
                                console.error('Error updating product:', err);
                                throw err;
                            });
                    }));

                    res.status(200).json({ message: 'File uploaded and data saved successfully', requestId: requestId });
                } catch (error) {
                    console.error('Database error:', error);
                    res.status(500).json({ message: 'Error inserting data into the database' });
                }
            })
            .on('error', (error) => {
                console.error('CSV parsing error:', error);
                res.status(500).json({ message: 'Error reading the CSV file' });
            });
    });
});

module.exports = router;
