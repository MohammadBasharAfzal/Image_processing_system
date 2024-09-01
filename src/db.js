const mysql = require('mysql2');

// Create a connection pool for MySQL
const pool = mysql.createPool({
    host: 'localhost',
    user: 'mdbasharafzal', // Your MySQL username
    password: 'MySQL@123', // Your MySQL password
    database: 'image_processing_db' // Your DB
});

// Promisify the query function for easier async/await usage
const promisePool = pool.promise();

// Function to update image URL in the `products` table
async function updateImageUrl(productId, imageUrl) {
    try {
        const [results] = await promisePool.query(
            'UPDATE products SET output_image_urls = ? WHERE id = ?',
            [imageUrl, productId]
        );
        return results;
    } catch (error) {
        throw new Error(`Database update failed: ${error.message}`);
    }
}

console.log('Connected to the MySQL database.');

module.exports = {
    updateImageUrl
};
