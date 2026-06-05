const axios = require('axios');
const logger = require('./logger');

const AI_API_URL = process.env.AI_API_URL || 'http://localhost:8000';

const analyzeWithAI = async (inputData) => {
  try {
    const response = await axios.post(`${AI_API_URL}/predict`, inputData);
    return response.data;
  } catch (error) {
    logger.error('Error calling AI API', { 
      message: error.message, 
      response: error.response?.data 
    });
    throw new Error('Gagal menghubungi AI API. Pastikan service AI berjalan.');
  }
};

module.exports = {
  analyzeWithAI
};
