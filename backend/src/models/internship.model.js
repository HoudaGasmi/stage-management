const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
  supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companySupervisor: {
    name: String,
    email: String,
    phone: String,
    position: String
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  reports: [{
    title: { type: String, required: true },
    content: String,
    file: { filename: String, url: String },
    submittedAt: { type: Date, default: Date.now },
    feedback: String,
    grade: { type: Number, min: 0, max: 20 },
    validated: { type: Boolean, default: false }
  }],
  objectives: [{ description: String, completed: { type: Boolean, default: false } }],
  finalGrade: { type: Number, min: 0, max: 20 },
  supervisorComment: String,
  studentEvaluation: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  },
  validated: { type: Boolean, default: false },
  validatedAt: Date,
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Internship', internshipSchema);
