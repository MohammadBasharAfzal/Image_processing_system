// src/db.js
const mysql = require('mysql2/promise'); // Use the promise version of mysql2

// Create a connection pool for MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'mdbasharafzal', // Your MySQL username
    password: 'MySQL@123', // Your MySQL password
    database: 'image_processing_db' // Your DB
});

// Function to update image URL in the database
async function updateImageUrl(serialNumber, outputImageUrl) {
    try {
        const [results] = await pool.query(
            'UPDATE products SET output_image_urls = ? WHERE serial_number = ?', // Assuming `serial_number` is the primary key
            [outputImageUrl, serialNumber]
        );
        return results;
    } catch (error) {
        throw new Error(`Database update failed: ${error.message}`);
    }
}

console.log('Connected to the MySQL database.');

module.exports = {
    pool,
    updateImageUrl
};
