const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  coverLetter: { type: String, maxlength: 3000 },
  cvSnapshot: {
    filename: String,
    url: String,
    uploadedAt: Date
  },
  compatibilityScore: { type: Number, min: 0, max: 100 },
  matchedSkills: [{ type: String }],
  missingSkills: [{ type: String }],
  notes: { type: String },
  timeline: [{
    status: { type: String },
    date: { type: Date, default: Date.now },
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  interviewDate: Date,
  feedback: { type: String }
}, {
  timestamps: true
});

// Unique: one student per offer
applicationSchema.index({ student: 1, offer: 1 }, { unique: true });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
