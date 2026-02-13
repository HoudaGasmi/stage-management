const router = require('express').Router();
const ctrl = require('../controllers/offer.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/domains', ctrl.getDomains);
router.get('/', protect, ctrl.getOffers);
router.get('/:id', protect, ctrl.getOffer);
router.post('/', protect, authorize('admin'), ctrl.createOffer);
router.patch('/:id', protect, authorize('admin'), ctrl.updateOffer);
router.patch('/:id/status', protect, authorize('admin'), ctrl.updateStatus);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteOffer);

module.exports = router;
