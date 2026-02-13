const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const Student = require('../models/student.model');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'student' } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email déjà utilisé.' });

    // Only admin can create admin/supervisor
    const allowedRole = req.user?.role === 'admin' ? role : 'student';

    const user = await User.create({ email, password, firstName, lastName, role: allowedRole });

    // Auto-create student profile
    if (allowedRole === 'student') {
      await Student.create({ user: user._id });
    }

    const token = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(201).json({
      message: 'Compte créé avec succès.',
      token,
      refreshToken,
      user: user.toSafeObject()
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email et mot de passe requis.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive)
      return res.status(401).json({ error: 'Identifiants invalides.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ error: 'Identifiants invalides.' });

    user.lastLogin = new Date();
    const token = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({
      message: 'Connexion réussie.',
      token,
      refreshToken,
      user: user.toSafeObject()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Token de rafraîchissement manquant.' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== refreshToken)
      return res.status(401).json({ error: 'Token invalide.' });

    const newToken = signToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ message: 'Déconnexion réussie.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id });
    }
    res.json({ user: user.toSafeObject(), profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Mot de passe modifié avec succès.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
