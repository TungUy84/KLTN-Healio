const express = require('express');
const router = express.Router();
const rawFoodController = require('../controllers/rawFoodController');
// const { protect, admin } = require('../middlewares/authMiddleware'); // Uncomment when auth is ready
const multer = require('multer');
const path = require('path');

// Configure Multer for basic uploads
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
// Note: Add 'protect' and 'admin' middleware later for security
router.get('/', rawFoodController.getRawFoods);
router.get('/:id', rawFoodController.getRawFoodById);
router.post('/', upload.single('image'), rawFoodController.createRawFood);
router.put('/:id', upload.single('image'), rawFoodController.updateRawFood);
router.delete('/:id', rawFoodController.deleteRawFood);

// Import Route
router.post('/import', upload.single('file'), rawFoodController.importRawFoods);

module.exports = router;
