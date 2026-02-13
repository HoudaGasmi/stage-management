const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags: [{ name: Auth, description: Authentification & gestion session }]
 */
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', protect, ctrl.logout);
router.get('/me', protect, ctrl.getMe);
router.patch('/change-password', protect, ctrl.changePassword);

module.exports = router;
