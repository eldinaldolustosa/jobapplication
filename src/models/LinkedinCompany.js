const mongoose = require('mongoose');

const linkedinCompanySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Nome da empresa é obrigatório'],
      trim: true,
    },
    linkedinUrl: {
      type: String,
      required: [true, 'URL do LinkedIn é obrigatória'],
      trim: true,
    },
    sector: { type: String, trim: true },
    size: { type: String, trim: true },
    website: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

linkedinCompanySchema.index({ userId: 1, linkedinUrl: 1 }, { unique: true });

module.exports = mongoose.model('LinkedinCompany', linkedinCompanySchema);
