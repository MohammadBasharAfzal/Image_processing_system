const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'mdbasharafzal', // My MySQL username
    password: 'MySQL@123', // My MySQL password
    database: 'image_processing_db' // My DB
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to the MySQL database.');
});

module.exports = connection;
