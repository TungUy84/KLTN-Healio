const router = require('express').Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tất cả route user đều cần login -> verifyToken
router.use(verifyToken);

router.get('/profile', userController.getProfile);
router.post('/onboarding', userController.completeOnboarding);
router.get('/diet-presets', userController.getDietPresets);

module.exports = router;