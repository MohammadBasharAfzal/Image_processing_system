import imageProcessingQueue from '../lib/queue';
import { updateImageUrl } from '../db';

imageProcessingQueue.process(async (job) => {
  const { imageId, imageUrl } = job.data;
  
  // Process the image
  console.log(`Processing image: ${imageUrl}`);
  
  // Simulate image processing (e.g., downloading, compressing)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update the database with the processed image URL
  try {
    await updateImageUrl(imageId, imageUrl);
    console.log('Image URL updated successfully.');
  } catch (error) {
    console.error(error.message);
  }
  
  return { status: 'completed' };
});
