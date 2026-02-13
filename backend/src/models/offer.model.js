const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: {
    name: { type: String, required: true, trim: true },
    logo: String,
    website: String,
    sector: String
  },
  description: { type: String, required: true, maxlength: 5000 },
  mission: { type: String, maxlength: 3000 },
  requiredSkills: [{
    name: { type: String, required: true, trim: true },
    level: { type: String, enum: ['débutant', 'intermédiaire', 'avancé', 'expert'], default: 'intermédiaire' },
    required: { type: Boolean, default: true }
  }],
  domain: { type: String, required: true },
  location: {
    city: String,
    country: { type: String, default: 'Tunisie' },
    remote: { type: Boolean, default: false }
  },
  duration: {
    months: { type: Number, required: true, min: 1, max: 12 },
    startDate: Date,
    endDate: Date
  },
  compensation: {
    paid: { type: Boolean, default: false },
    amount: Number,
    currency: { type: String, default: 'TND' }
  },
  targetLevel: [{
    type: String,
    enum: ['L1', 'L2', 'L3', 'M1', 'M2', 'Ingénieur 1', 'Ingénieur 2', 'Ingénieur 3']
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'closed', 'archived'],
    default: 'draft'
  },
  maxCandidates: { type: Number, default: 10 },
  currentCandidates: { type: Number, default: 0 },
  deadline: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  tags: [{ type: String, trim: true }]
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

offerSchema.virtual('isExpired').get(function () {
  return this.deadline && this.deadline < new Date();
});

offerSchema.index({ status: 1, deadline: 1 });
offerSchema.index({ domain: 1 });
offerSchema.index({ 'requiredSkills.name': 1 });
offerSchema.index({ title: 'text', description: 'text', 'company.name': 'text' });

module.exports = mongoose.model('Offer', offerSchema);
