const Student = require('../models/student.model');
const Offer = require('../models/offer.model');
const RecommendationService = require('../services/recommendation.service');

// GET /api/recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(400).json({ error: 'Profil étudiant requis.' });

    const minScore = parseInt(process.env.RECOMMENDATION_MIN_SCORE) || 30;
    const offers = await Offer.find({ status: 'published' });

    const recommendations = await RecommendationService.getRecommendations(student, offers, minScore);

    res.json({
      recommendations: recommendations.map(r => ({
        offer: r.offer,
        compatibilityScore: r.score,
        matchedSkills: r.matched,
        missingSkills: r.missing
      })),
      total: recommendations.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/recommendations/profile-analysis
exports.analyzeProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(400).json({ error: 'Profil étudiant requis.' });

    const allOffers = await Offer.find({ status: 'published' });
    const analysis = RecommendationService.analyzeProfile(student, allOffers);

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/recommendations/score/:offerId
exports.getOfferScore = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(400).json({ error: 'Profil étudiant requis.' });

    const offer = await Offer.findById(req.params.offerId);
    if (!offer) return res.status(404).json({ error: 'Offre non trouvée.' });

    const result = RecommendationService.calculateScore(student, offer);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
