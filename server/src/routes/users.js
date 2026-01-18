const router = require('express').Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Tất cả route user đều cần login -> verifyToken
router.use(verifyToken);

router.get('/profile', userController.getProfile);
router.post('/onboarding', userController.completeOnboarding);
router.get('/diet-presets', userController.getDietPresets);

// PB_19: Favorites
router.get('/favorites', userController.getFavorites);
router.post('/favorites/toggle', userController.toggleFavorite);

// PB_23: Diary
router.post('/daily-log', userController.addToDiary);
router.get('/daily-log', userController.getDailyLog);

module.exports = router;