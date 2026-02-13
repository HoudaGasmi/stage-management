// application.routes.js
const appRouter = require('express').Router();
const appCtrl = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

appRouter.use(protect);
appRouter.post('/', authorize('student'), appCtrl.apply);
appRouter.get('/', appCtrl.getApplications);
appRouter.get('/:id', appCtrl.getApplication);
appRouter.patch('/:id/status', authorize('admin', 'supervisor'), appCtrl.updateStatus);
appRouter.delete('/:id', authorize('student'), appCtrl.withdraw);

module.exports = appRouter;
