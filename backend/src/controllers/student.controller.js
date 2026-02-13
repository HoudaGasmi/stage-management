const Student = require('../models/student.model');
const path = require('path');

// GET /api/students/me
exports.getMyProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate('user', '-password');
    if (!student) return res.status(404).json({ error: 'Profil non trouvé.' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/students/me
exports.updateMyProfile = async (req, res) => {
  try {
    const allowedFields = ['bio', 'university', 'department', 'level', 'linkedIn',
      'github', 'portfolio', 'availability', 'desiredDomain', 'gpa', 'languages', 'studentId'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const student = await Student.findOneAndUpdate(
      { user: req.user._id }, updates, { new: true, runValidators: true }
    ).populate('user', '-password');

    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/students/me/skills
exports.addSkill = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const { name, level = 'intermédiaire', category = 'technique' } = req.body;

    const exists = student.skills.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (exists) return res.status(409).json({ error: 'Compétence déjà ajoutée.' });

    student.skills.push({ name, level, category });
    await student.save();
    res.status(201).json(student.skills);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/students/me/skills/:skillId
exports.removeSkill = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    student.skills = student.skills.filter(s => s._id.toString() !== req.params.skillId);
    await student.save();
    res.json({ message: 'Compétence supprimée.', skills: student.skills });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/students/me/cv
exports.uploadCv = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Fichier CV requis.' });

    const cvUrl = `/uploads/cvs/${req.file.filename}`;
    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      {
        cv: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          uploadedAt: new Date(),
          url: cvUrl
        }
      },
      { new: true }
    );

    res.json({ message: 'CV téléversé avec succès.', cv: student.cv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/students (admin only)
exports.getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, level } = req.query;
    const query = {};
    if (level) query.level = level;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const students = await Student.find(query)
      .populate('user', 'firstName lastName email isActive')
      .sort('-createdAt').skip(skip).limit(parseInt(limit));

    const total = await Student.countDocuments(query);
    res.json({ students, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
