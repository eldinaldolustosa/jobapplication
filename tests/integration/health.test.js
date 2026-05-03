const request = require('supertest');
const app = require('../../src/app');

describe('GET /health', () => {
  it('responde 200 com status ok e timestamp ISO', async () => {
    const res = await request(app).get('/health').expect(200).expect('Content-Type', /json/);

    expect(res.body).toMatchObject({ status: 'ok' });
    expect(res.body.timestamp).toBeDefined();
    expect(() => new Date(res.body.timestamp)).not.toThrow();
  });
});
