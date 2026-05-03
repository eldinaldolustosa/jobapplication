const mongoose = require('mongoose');
const { connectTestMongo, disconnectTestMongo } = require('../setup/mongo-memory');

/**
 * Smoke test do ambiente Mongo em memória + Mongoose.
 * Remova ou substitua quando houver testes de API que usem o banco.
 */
describe('MongoDB em memória (smoke)', () => {
  beforeAll(async () => {
    await connectTestMongo();
  });

  afterAll(async () => {
    await disconnectTestMongo();
  });

  it('conecta e responde a ping administrativo', async () => {
    const admin = mongoose.connection.db.admin();
    const { ok } = await admin.ping();
    expect(ok).toBe(1);
  });
});
