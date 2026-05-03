const mongoose = require('mongoose');

const linkedinContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    linkedinUrl: {
      type: String,
      required: [true, 'URL do LinkedIn é obrigatória'],
      trim: true,
    },
    type: {
      type: String,
      enum: { values: ['Recrutador', 'Colaborador'], message: 'Tipo deve ser Recrutador ou Colaborador' },
      required: [true, 'Tipo é obrigatório'],
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LinkedinCompany',
      default: null,
    },
    title: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    notes: {
      type: String,
      maxlength: [500, 'Observações deve ter no máximo 500 caracteres'],
      trim: true,
    },
  },
  { timestamps: true }
);

linkedinContactSchema.index({ userId: 1, linkedinUrl: 1 }, { unique: true });

module.exports = mongoose.model('LinkedinContact', linkedinContactSchema);
