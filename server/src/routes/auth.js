const router = require('express').Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);  // PB_03 Step 1: Send OTP
router.post('/register/verify', authController.verifyRegisterOtp); // PB_03 Step 2: Verify OTP -> Active

router.post('/login', authController.login); // PB_01: Login
router.post('/google', authController.googleLogin); // PB_02: Google Login

router.post('/forgot-password', authController.forgotPassword); // PB_04 Step 1: Send OTP
router.post('/reset-password/verify', authController.verifyResetOtp); // PB_04 Step 2: Verify OTP
router.post('/reset-password', authController.resetPassword); // PB_04 Step 3: Update Password

router.post('/login-admin', authController.loginAdmin);

module.exports = router;