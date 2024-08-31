const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csvParser = require('csv-parser');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        if (ext !== '.csv') {
            return cb(new Error('Only CSV files are allowed'), false);
        }
        cb(null, true);
    }
}).single('file');

// In-memory storage for demonstration purposes
const requestStatuses = {};

// Define the upload route
router.post('/upload', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const requestId = uuidv4(); // Generate a unique request ID

        // Save the request ID and initial status
        requestStatuses[requestId] = {
            status: 'Processing', // Initial status
            filePath: filePath
        };

        // Check if the CSV contains the correct headers
        const headers = ['S. No.', 'Product Name', 'Input Image Urls'];
        let validHeaders = false;

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(csvParser())
            .on('headers', (csvHeaders) => {
                validHeaders = headers.every(header => csvHeaders.includes(header));
            })
            .on('data', (row) => {
                // We can process each row here if needed
            })
            .on('end', () => {
                if (!validHeaders) {
                    // Remove the request ID if headers are invalid
                    delete requestStatuses[requestId];
                    return res.status(400).json({ message: 'Invalid CSV headers' });
                }

                // If everything is okay, return the request ID
                res.status(200).json({ message: 'File uploaded and validated successfully', requestId: requestId });
            })
            .on('error', (error) => {
                res.status(500).json({ message: 'Error reading the CSV file' });
            });
    });
});

module.exports = router;
