const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/generate-recipe', aiController.generateRecipe);
router.post('/suggest-meal-plan', authMiddleware.verifyToken, aiController.suggestMealPlan);
router.post('/raw-food-info', authMiddleware.verifyToken, aiController.generateRawFoodInfo);

module.exports = router;
