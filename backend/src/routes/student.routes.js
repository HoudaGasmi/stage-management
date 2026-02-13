// ─── student.routes.js ────────────────────────────────────────────────────
const sRouter = require('express').Router();
const sCtrl = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

sRouter.use(protect);
sRouter.get('/me', sCtrl.getMyProfile);
sRouter.patch('/me', sCtrl.updateMyProfile);
sRouter.post('/me/skills', authorize('student'), sCtrl.addSkill);
sRouter.delete('/me/skills/:skillId', authorize('student'), sCtrl.removeSkill);
sRouter.post('/me/cv', authorize('student'), upload.single('cv'), sCtrl.uploadCv);
sRouter.get('/', authorize('admin', 'supervisor'), sCtrl.getAllStudents);

module.exports = sRouter;
