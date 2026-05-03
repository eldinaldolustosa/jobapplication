const path = require('path');
const multer = require('multer');
const jobApplicationService = require('./jobApplicationService');

const MAX_SIZE_MB = parseInt(process.env.UPLOAD_MAX_SIZE_MB || '5', 10);
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Formato de arquivo não suportado. Envie um PDF.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
}).single('resume');

const uploadResume = async (jobApplicationId, userId, file) => {
  const application = await jobApplicationService.findById(jobApplicationId, userId);

  application.resume = {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  };
  await application.save();

  return application.resume;
};

const getResume = async (jobApplicationId, userId) => {
  const application = await jobApplicationService.findById(jobApplicationId, userId);
  if (!application.resume || !application.resume.filename) {
    const error = new Error('Nenhum currículo encontrado para esta candidatura');
    error.status = 404;
    throw error;
  }
  return application.resume;
};

module.exports = { upload, uploadResume, getResume };
