const Stage = require('../models/Stage');
const jobApplicationService = require('./jobApplicationService');
const JobApplication = require('../models/JobApplication');

const addStage = async (jobApplicationId, userId, { status, date, notes }) => {
  const application = await jobApplicationService.findById(jobApplicationId, userId);

  const lastStage = await Stage.findOne({ jobApplicationId }).sort({ date: -1 });
  if (lastStage && new Date(date) < new Date(lastStage.date)) {
    const error = new Error('A data da nova etapa não pode ser anterior à última etapa registrada');
    error.status = 422;
    throw error;
  }

  if (lastStage && lastStage.status === status) {
    const error = new Error('Não é permitido registrar a mesma etapa consecutivamente sem mudança de status');
    error.status = 422;
    throw error;
  }

  const stage = await Stage.create({ jobApplicationId, status, date, notes });

  application.status = status;
  await application.save();

  return stage;
};

const getStages = async (jobApplicationId, userId) => {
  await jobApplicationService.findById(jobApplicationId, userId);
  return Stage.find({ jobApplicationId }).sort({ date: 1 });
};

module.exports = { addStage, getStages };
