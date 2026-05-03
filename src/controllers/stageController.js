const stageService = require('../services/stageService');

const addStage = async (req, res, next) => {
  try {
    const stage = await stageService.addStage(req.params.id, req.userId, req.body);
    res.status(201).json(stage);
  } catch (err) {
    next(err);
  }
};

const getStages = async (req, res, next) => {
  try {
    const stages = await stageService.getStages(req.params.id, req.userId);
    res.json(stages);
  } catch (err) {
    next(err);
  }
};

module.exports = { addStage, getStages };
