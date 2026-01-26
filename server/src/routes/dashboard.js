const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

// All dashboard routes require admin authentication
router.use(verifyAdmin);

// PB_40: Get Dashboard Stats
router.get('/stats', dashboardController.getStats);

// PB_41: Get Recent Activities
router.get('/activities', dashboardController.getRecentActivities);

// PB_43: Get Top Foods
router.get('/top-foods', dashboardController.getTopFoods);

module.exports = router;
