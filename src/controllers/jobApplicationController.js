const jobApplicationService = require('../services/jobApplicationService');

const create = async (req, res, next) => {
  try {
    const application = await jobApplicationService.create(req.userId, req.body);
    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
};

const findAll = async (req, res, next) => {
  try {
    const applications = await jobApplicationService.findAll(req.userId);
    res.json(applications);
  } catch (err) {
    next(err);
  }
};

const findOne = async (req, res, next) => {
  try {
    const application = await jobApplicationService.findById(req.params.id, req.userId);
    res.json(application);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const application = await jobApplicationService.update(req.params.id, req.userId, req.body);
    res.json(application);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await jobApplicationService.remove(req.params.id, req.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = { create, findAll, findOne, update, remove };
