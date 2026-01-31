const router = require('express').Router();
const statsController = require('../controllers/statsController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

router.use(verifyAdmin);

router.get('/growth', statsController.getUserGrowth);
router.get('/trending-foods', statsController.getTrendingFoods);
router.get('/demographics', statsController.getUserDemographics);
router.get('/diets', statsController.getDietStats);
router.get('/export', statsController.exportStats);

module.exports = router;
