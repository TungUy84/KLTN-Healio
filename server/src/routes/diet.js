const express = require('express');
const router = express.Router();
const dietController = require('../controllers/dietController');

router.get('/', dietController.getAllDiets);
router.get('/:id', dietController.getDietById);
router.post('/', dietController.createDiet);
router.put('/:id', dietController.updateDiet);
router.delete('/:id', dietController.deleteDiet);

module.exports = router;
