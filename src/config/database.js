const mongoose = require('mongoose');

const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 3;

const connectDB = async (retries = MAX_RETRIES) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    const { host, name } = conn.connection;
    console.log(`MongoDB connected → host: ${host} | db: ${name}`);

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected.');
    });
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (retries > 0) {
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} attempts left)`);
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
      return connectDB(retries - 1);
    }
    console.error('Could not connect to MongoDB. Exiting.');
    process.exit(1);
  }
};

module.exports = connectDB;
