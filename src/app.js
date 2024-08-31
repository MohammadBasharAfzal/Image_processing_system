const express = require('express');
const bodyParser = require('body-parser');
const uploadRoutes = require('./routes/uploadRoutes'); // Ensure this is the correct path
const app = express();
const path = require('path');

// Middleware for parsing application/json
app.use(bodyParser.json());

// Middleware for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Static folder to serve uploaded files (optional)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Using the upload routes
app.use('/api', uploadRoutes); // Ensure uploadRoutes is a function (router)

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to Image-Processing System');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
