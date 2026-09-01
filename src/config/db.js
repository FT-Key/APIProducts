const mongoose = require('mongoose');

let cached = null;

const connectDB = async () => {
  if (cached) return cached;
  try {
    cached = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    return cached;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error;
  }
};

module.exports = connectDB;
