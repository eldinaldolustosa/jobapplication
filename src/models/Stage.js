const mongoose = require('mongoose');
const { STAGES } = require('./JobApplication');

const stageSchema = new mongoose.Schema(
  {
    jobApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
      required: true,
    },
    status: {
      type: String,
      enum: { values: STAGES, message: `Status deve ser um dos valores: ${STAGES.join(', ')}` },
      required: [true, 'Status da etapa é obrigatório'],
    },
    date: {
      type: Date,
      required: [true, 'Data da etapa é obrigatória'],
    },
    notes: {
      type: String,
      maxlength: [1000, 'Observações deve ter no máximo 1000 caracteres'],
      trim: true,
    },
  },
  { timestamps: true }
);

stageSchema.index({ jobApplicationId: 1, date: 1 });

module.exports = mongoose.model('Stage', stageSchema);
