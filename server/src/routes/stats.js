const router = require('express').Router();
const statsController = require('../controllers/statsController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

router.use(verifyAdmin);

router.get('/overview', statsController.getSystemOverview);
router.get('/activities', statsController.getRecentActivities);
router.get('/growth', statsController.getUserGrowth);
router.get('/trending-foods', statsController.getTrendingFoods);
router.get('/demographics', statsController.getUserDemographics);
router.get('/diets', statsController.getDietStats);
router.get('/activity-peak', statsController.getActivityPeak); // New
router.get('/bmi-dist', statsController.getBMIDistribution);   // New
router.get('/macro-radar', statsController.getMacroStats);     // New
// Mega Dashboard V3 Routes
router.get('/system', statsController.getSystemStats);
router.get('/nutrition', statsController.getNutritionStats);
router.get('/goals', statsController.getGoalStats);
router.get('/insights', statsController.getUserInsights);
router.get('/foods-stats', statsController.getFoodStats);

module.exports = router;
