const Offer = require('../models/offer.model');

// GET /api/offers
exports.getOffers = async (req, res) => {
  try {
    const { page = 1, limit = 10, domain, location, search, status = 'published', level } = req.query;
    const query = {};

    if (req.user.role !== 'admin') query.status = 'published';
    else if (status) query.status = status;

    if (domain) query.domain = domain;
    if (location) query['location.city'] = new RegExp(location, 'i');
    if (level) query.targetLevel = level;
    if (search) query.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [offers, total] = await Promise.all([
      Offer.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)).populate('createdBy', 'firstName lastName'),
      Offer.countDocuments(query)
    ]);

    res.json({ offers, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/offers/:id
exports.getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('createdBy', 'firstName lastName email');
    if (!offer) return res.status(404).json({ error: 'Offre non trouvée.' });
    // Increment views
    await Offer.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/offers
exports.createOffer = async (req, res) => {
  try {
    const offer = await Offer.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(offer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/offers/:id
exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!offer) return res.status(404).json({ error: 'Offre non trouvée.' });
    res.json(offer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/offers/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const offer = await Offer.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!offer) return res.status(404).json({ error: 'Offre non trouvée.' });
    res.json({ message: `Statut mis à jour: ${status}`, offer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/offers/:id
exports.deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndUpdate(req.params.id, { status: 'archived' });
    res.json({ message: 'Offre archivée.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/offers/domains
exports.getDomains = async (req, res) => {
  try {
    const domains = await Offer.distinct('domain', { status: 'published' });
    res.json(domains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
