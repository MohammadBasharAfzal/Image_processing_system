const express = require('express');
const path = require('path');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the upload routes
app.use('/api', uploadRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
