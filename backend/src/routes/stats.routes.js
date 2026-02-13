const router = require('express').Router();
const ctrl = require('../controllers/stats.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/dashboard', protect, authorize('admin', 'supervisor'), ctrl.getDashboard);

module.exports = router;
