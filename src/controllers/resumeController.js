const resumeService = require('../services/resumeService');
const path = require('path');

const uploadResume = (req, res, next) => {
  resumeService.upload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          message: `Arquivo excede o tamanho máximo permitido de ${process.env.UPLOAD_MAX_SIZE_MB || 5}MB`,
        });
      }
      return res.status(415).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }
    try {
      const resume = await resumeService.uploadResume(req.params.id, req.userId, req.file);
      res.status(201).json(resume);
    } catch (serviceErr) {
      next(serviceErr);
    }
  });
};

const getResume = async (req, res, next) => {
  try {
    const resume = await resumeService.getResume(req.params.id, req.userId);
    res.json(resume);
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadResume, getResume };
