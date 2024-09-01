const express = require('express');
const path = require('path');
const uploadRoutes = require('./routes/uploadRoutes');
const imageProcessingQueue = require('./lib/queue'); // Import the queue

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the upload routes
app.use('/api', uploadRoutes);

// Example route to add an image to the queue
app.post('/api/add-image', async (req, res) => {
  const { imageId, imageUrl } = req.body;
  
  if (!imageId || !imageUrl) {
    return res.status(400).json({ error: 'Image ID and URL are required' });
  }
  
  try {
    // Add the image processing job to the queue
    await imageProcessingQueue.add({ imageId, imageUrl });
    res.status(200).json({ message: 'Image added to queue successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add image to queue' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
