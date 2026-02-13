// recommendation.routes.js
const recRouter = require('express').Router();
const recCtrl = require('../controllers/recommendation.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

recRouter.use(protect, authorize('student'));
recRouter.get('/', recCtrl.getRecommendations);
recRouter.get('/profile-analysis', recCtrl.analyzeProfile);
recRouter.get('/score/:offerId', recCtrl.getOfferScore);

module.exports = recRouter;
