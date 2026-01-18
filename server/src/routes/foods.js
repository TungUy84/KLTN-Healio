const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');
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
router.get('/', foodController.getFoods);
router.get('/:id', foodController.getFoodById);
router.post('/', upload.single('image'), foodController.createFood);
router.put('/:id', upload.single('image'), foodController.updateFood);
router.delete('/:id', foodController.deleteFood);

module.exports = router;
