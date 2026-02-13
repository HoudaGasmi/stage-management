const Internship = require('../models/internship.model');
const Application = require('../models/application.model');
const Student = require('../models/student.model');

// POST /api/internships (admin creates from accepted application)
exports.createInternship = async (req, res) => {
  try {
    const { applicationId, supervisorId, startDate, endDate, companySupervisor, objectives } = req.body;
    const application = await Application.findById(applicationId).populate('offer');
    if (!application || application.status !== 'accepted')
      return res.status(400).json({ error: 'Candidature acceptée requise.' });

    const internship = await Internship.create({
      application: applicationId,
      student: application.student,
      offer: application.offer._id,
      supervisor: supervisorId,
      companySupervisor, startDate, endDate, objectives,
      status: 'active'
    });

    res.status(201).json(internship);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/internships
exports.getInternships = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      query.student = student._id;
    } else if (req.user.role === 'supervisor') {
      query.supervisor = req.user._id;
    }

    const internships = await Internship.find(query)
      .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName email' } })
      .populate('offer', 'title company')
      .populate('supervisor', 'firstName lastName email')
      .sort('-createdAt');

    res.json(internships);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/internships/:id
exports.getInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate({ path: 'student', populate: { path: 'user', select: '-password' } })
      .populate('offer')
      .populate('supervisor', 'firstName lastName email');
    if (!internship) return res.status(404).json({ error: 'Stage non trouvé.' });
    res.json(internship);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/internships/:id/reports
exports.submitReport = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ error: 'Stage non trouvé.' });

    const report = {
      title: req.body.title,
      content: req.body.content,
      submittedAt: new Date()
    };
    if (req.file) {
      report.file = { filename: req.file.filename, url: `/uploads/${req.file.filename}` };
    }

    internship.reports.push(report);
    await internship.save();
    res.status(201).json({ message: 'Rapport soumis.', report: internship.reports.slice(-1)[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/internships/:id/reports/:reportId/validate
exports.validateReport = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    const report = internship.reports.id(req.params.reportId);
    if (!report) return res.status(404).json({ error: 'Rapport non trouvé.' });

    report.feedback = req.body.feedback;
    report.grade = req.body.grade;
    report.validated = true;
    await internship.save();
    res.json({ message: 'Rapport validé.', report });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/internships/:id/validate
exports.validateInternship = async (req, res) => {
  try {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      {
        status: 'completed',
        validated: true,
        validatedAt: new Date(),
        validatedBy: req.user._id,
        finalGrade: req.body.finalGrade,
        supervisorComment: req.body.comment
      },
      { new: true }
    );
    res.json({ message: 'Stage validé avec succès.', internship });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
