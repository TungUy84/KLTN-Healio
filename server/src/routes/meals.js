const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const multer = require('multer');
const path = require('path');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// Routes
router.get('/', mealController.getMeals);
router.get('/:id', mealController.getMealById);
router.post('/', upload.single('image'), mealController.createMeal);
router.put('/:id', upload.single('image'), mealController.updateMeal);
router.delete('/:id', mealController.deleteMeal);

module.exports = router;
