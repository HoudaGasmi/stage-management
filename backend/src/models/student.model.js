const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  studentId: { type: String, unique: true, sparse: true },
  university: { type: String, trim: true },
  department: { type: String, trim: true },
  level: {
    type: String,
    enum: ['L1', 'L2', 'L3', 'M1', 'M2', 'Ingénieur 1', 'Ingénieur 2', 'Ingénieur 3']
  },
  skills: [{
    name: { type: String, required: true, trim: true },
    level: { type: String, enum: ['débutant', 'intermédiaire', 'avancé', 'expert'], default: 'intermédiaire' },
    category: { type: String, enum: ['technique', 'langue', 'soft-skill', 'autre'], default: 'technique' }
  }],
  languages: [{
    name: { type: String, required: true },
    level: { type: String, enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'natif'] }
  }],
  cv: {
    filename: String,
    originalName: String,
    uploadedAt: Date,
    url: String
  },
  bio: { type: String, maxlength: 1000 },
  linkedIn: { type: String },
  github: { type: String },
  portfolio: { type: String },
  availability: {
    startDate: Date,
    endDate: Date,
    fullTime: { type: Boolean, default: true }
  },
  desiredDomain: [{ type: String }],
  gpa: { type: Number, min: 0, max: 20 }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

studentSchema.index({ 'skills.name': 1 });
studentSchema.index({ level: 1 });

module.exports = mongoose.model('Student', studentSchema);
