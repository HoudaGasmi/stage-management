const router = require('express').Router();
const ctrl = require('../controllers/internship.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);
router.post('/', authorize('admin'), ctrl.createInternship);
router.get('/', ctrl.getInternships);
router.get('/:id', ctrl.getInternship);
router.post('/:id/reports', authorize('student'), upload.single('file'), ctrl.submitReport);
router.patch('/:id/reports/:reportId/validate', authorize('supervisor', 'admin'), ctrl.validateReport);
router.patch('/:id/validate', authorize('supervisor', 'admin'), ctrl.validateInternship);

module.exports = router;
