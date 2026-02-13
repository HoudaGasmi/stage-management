const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id: { type: string }
 *         email: { type: string, format: email }
 *         role: { type: string, enum: [student, supervisor, admin] }
 *         firstName: { type: string }
 *         lastName: { type: string }
 *         isActive: { type: boolean }
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Mot de passe requis'],
    minlength: [8, 'Minimum 8 caractères'],
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'supervisor', 'admin'],
    default: 'student'
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  avatar: { type: String },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
