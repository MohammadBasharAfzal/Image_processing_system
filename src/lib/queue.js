const Bull = require('bull');
const imageProcessingQueue = new Bull('image-processing', {
  redis: {
    host: 'localhost',
    port: 6379
  }
});

module.exports = imageProcessingQueue;
