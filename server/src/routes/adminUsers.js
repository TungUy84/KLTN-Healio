const router = require('express').Router();
const adminUserController = require('../controllers/adminUserController');
const { verifyAdmin } = require('../middlewares/authMiddleware');

router.use(verifyAdmin);


// PB_61: User Statistics (MUST be before /:id)
router.get('/stats', adminUserController.getStats);

// PB_57: List accounts
router.get('/', adminUserController.list);
router.post('/', adminUserController.create);
// PB_58, PB_59: User detail
router.get('/:id', adminUserController.getById);
router.delete('/:id', adminUserController.delete);
router.get('/:id/comprehensive', adminUserController.getComprehensiveUserDetail);
// PB_60: Ban / Unban
router.patch('/:id/ban', adminUserController.ban);
router.patch('/:id/unban', adminUserController.unban);
router.patch('/:id/reset-password', adminUserController.resetPassword);
router.patch('/:id/role', adminUserController.changeRole);

module.exports = router;
