const router = require('express').Router();
const adminUserController = require('../controllers/adminUserController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

router.use(verifyAdmin);

// PB_57: List accounts
router.get('/', adminUserController.list);
// PB_58, PB_59: User detail
router.get('/:id', adminUserController.getById);
// PB_60: Ban / Unban
router.patch('/:id/ban', adminUserController.ban);
router.patch('/:id/unban', adminUserController.unban);

module.exports = router;
