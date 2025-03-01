const axios = require('axios');
const { sendMessage } = require('../handles/message');

module.exports = {
  name: 'gmage',
  description: 'Generate an image based on a prompt.',
  role: 1,
  author: 'Mark and GeoDevz69',
  
  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt.\n\nUsage:\nExample: gen cat or dog'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `https://zaikyoo.onrender.com/api/artv1?p=${encodeURIComponent(prompt)}`;
    

    try {
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating image:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
