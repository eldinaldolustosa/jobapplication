require('dotenv').config({ path: '.env.test' });
const mongoose = require('mongoose');

const connectTestDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  });
};

const clearCollections = async (...modelNames) => {
  const targets = modelNames.length > 0 ? modelNames : Object.keys(mongoose.connection.collections);
  for (const name of targets) {
    const col = mongoose.connection.collections[name.toLowerCase()] ||
                mongoose.connection.collections[name];
    if (col) await col.deleteMany({});
  }
};

const closeTestDB = async () => {
  await mongoose.connection.close();
};

module.exports = { connectTestDB, clearCollections, closeTestDB };
