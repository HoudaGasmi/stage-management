const router = require('express').Router();
const User = require('../models/user.model');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

// GET all users (admin)
router.get('/', authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') }
    ];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(parseInt(limit)),
      User.countDocuments(query)
    ]);
    res.json({ users: users.map(u => u.toSafeObject()), total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /users/:id (admin can update role/status)
router.patch('/:id', authorize('admin'), async (req, res) => {
  try {
    const { role, isActive, firstName, lastName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive, firstName, lastName, phone },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /users/:id (soft delete)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Utilisateur désactivé.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
