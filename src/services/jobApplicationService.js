const JobApplication = require('../models/JobApplication');

const create = async (userId, data) => {
  return JobApplication.create({ userId, ...data });
};

const findAll = async (userId) => {
  return JobApplication.find({ userId }).sort({ createdAt: -1 });
};

const findById = async (id, userId) => {
  const app = await JobApplication.findById(id);
  if (!app) {
    const error = new Error('Candidatura não encontrada');
    error.status = 404;
    throw error;
  }
  if (app.userId.toString() !== userId) {
    const error = new Error('Acesso não autorizado');
    error.status = 403;
    throw error;
  }
  return app;
};

const update = async (id, userId, data) => {
  const app = await findById(id, userId);
  Object.assign(app, data);
  return app.save();
};

const remove = async (id, userId) => {
  const app = await findById(id, userId);
  await app.deleteOne();
};

module.exports = { create, findAll, findById, update, remove };
