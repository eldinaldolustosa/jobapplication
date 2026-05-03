const mongoose = require('mongoose');

const STAGES = ['Enviado', 'Feedback', 'Entrevista', 'Entrevista Técnica', 'Negociação', 'Contrato'];

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: String,
      required: [true, 'Empresa é obrigatória'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Cargo é obrigatório'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    salary: {
      type: Number,
      min: [0, 'Salário deve ser um valor positivo'],
    },
    benefits: [{ type: String, trim: true }],
    applicationDate: {
      type: Date,
      required: [true, 'Data de aplicação é obrigatória'],
    },
    status: {
      type: String,
      enum: { values: STAGES, message: `Status deve ser um dos valores: ${STAGES.join(', ')}` },
      default: 'Enviado',
    },
    resume: {
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      uploadedAt: Date,
    },
    linkedinCompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LinkedinCompany',
      default: null,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LinkedinContact',
      default: null,
    },
  },
  { timestamps: true }
);

jobApplicationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
module.exports.STAGES = STAGES;
