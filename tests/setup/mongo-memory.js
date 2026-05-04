const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Sobe MongoDB em memória e conecta o Mongoose. Use em beforeAll de testes de integração.
 */
async function connectTestMongo() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.MONGODB_URI = uri;
  await mongoose.connect(uri);
}

/**
 * Limpa dados e encerra servidor em memória. Use em afterAll.
 */
async function disconnectTestMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase().catch(() => {});
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = undefined;
  }
}

module.exports = { connectTestMongo, disconnectTestMongo };
