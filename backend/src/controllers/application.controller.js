const Application = require('../models/application.model');
const Offer = require('../models/offer.model');
const Student = require('../models/student.model');
const RecommendationService = require('../services/recommendation.service');

// POST /api/applications
exports.apply = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(400).json({ error: 'Profil étudiant requis.' });

    const offer = await Offer.findById(req.body.offerId);
    if (!offer || offer.status !== 'published')
      return res.status(400).json({ error: 'Offre non disponible.' });

    const existing = await Application.findOne({ student: student._id, offer: offer._id });
    if (existing) return res.status(409).json({ error: 'Candidature déjà soumise pour cette offre.' });

    // Calculate compatibility score
    const { score, matched, missing } = RecommendationService.calculateScore(student, offer);

    const application = await Application.create({
      student: student._id,
      offer: offer._id,
      coverLetter: req.body.coverLetter,
      cvSnapshot: student.cv,
      compatibilityScore: score,
      matchedSkills: matched,
      missingSkills: missing,
      timeline: [{ status: 'pending', note: 'Candidature soumise' }]
    });

    await Offer.findByIdAndUpdate(offer._id, { $inc: { currentCandidates: 1 } });

    res.status(201).json(await application.populate([
      { path: 'offer', select: 'title company domain' },
      { path: 'student', populate: { path: 'user', select: 'firstName lastName' } }
    ]));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/applications (admin/supervisor sees all, student sees own)
exports.getApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, offerId } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      query.student = student._id;
    }
    if (status) query.status = status;
    if (offerId) query.offer = offerId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [applications, total] = await Promise.all([
      Application.find(query)
        .sort('-createdAt').skip(skip).limit(parseInt(limit))
        .populate('offer', 'title company domain duration')
        .populate({ path: 'student', populate: { path: 'user', select: 'firstName lastName email' } }),
      Application.countDocuments(query)
    ]);

    res.json({ applications, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/applications/:id
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('offer')
      .populate({ path: 'student', populate: { path: 'user', select: '-password' } });
    if (!application) return res.status(404).json({ error: 'Candidature non trouvée.' });
    res.json(application);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/applications/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: 'Candidature non trouvée.' });

    application.status = status;
    application.timeline.push({ status, note, updatedBy: req.user._id });
    await application.save();

    res.json({ message: 'Statut mis à jour.', application });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/applications/:id (withdraw)
exports.withdraw = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const application = await Application.findOne({ _id: req.params.id, student: student._id });
    if (!application) return res.status(404).json({ error: 'Candidature non trouvée.' });
    if (!['pending', 'reviewing'].includes(application.status))
      return res.status(400).json({ error: 'Impossible de retirer cette candidature.' });

    application.status = 'withdrawn';
    application.timeline.push({ status: 'withdrawn', note: 'Retrait par l\'étudiant' });
    await application.save();
    res.json({ message: 'Candidature retirée.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
