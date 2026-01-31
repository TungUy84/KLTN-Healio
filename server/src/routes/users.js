const router = require('express').Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Tất cả route user đều cần login -> verifyToken
router.use(verifyToken);

router.get('/profile', userController.getProfile);
router.post('/upload-avatar', upload.single('avatar'), userController.uploadAvatar);
router.post('/onboarding', userController.completeOnboarding);
router.get('/diet-presets', userController.getDietPresets);

// PB_30 - PB_38: Profile Management
router.put('/profile', userController.updateProfile);
router.post('/weight-log', userController.logWeight);
router.get('/weight-log', userController.getWeightHistory);
router.put('/change-password', userController.changePassword);

// PB_19: Favorites
router.get('/favorites', userController.getFavorites);
router.post('/favorites/toggle', userController.toggleFavorite);

// PB_23: Diary
router.post('/daily-log', userController.addToDiary);
router.get('/daily-log', userController.getDailyLog);
router.put('/daily-log/:id', userController.updateDailyLog);
router.delete('/daily-log/:id', userController.deleteDailyLog);

// Stats
router.get('/stats/calories', userController.getWeeklyStats);

module.exports = router;