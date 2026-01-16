const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');
const Otp = require('../models/Otp');
const UserProfile = require('../models/UserProfile');
const UserNutritionTarget = require('../models/UserNutritionTarget');
const { sendEmail, generateOTP } = require('../utils/emailService');

// --- Helper Functions ---
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
};

// --- PB_01: Login ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không đúng' });

    // 2. Check Auth Provider (Prevent password login for Google accounts if strict)
    if (user.auth_provider === 'google' && !user.password_hash) {
        return res.status(400).json({ message: 'Vui lòng đăng nhập bằng Google' });
    }

    // 3. Check Pending Status (PB_03 AC6 implies account inactive until OTP)
    if (user.status === 'pending') {
        // Optional: Resend OTP here if needed, but for now just tell them
        return res.status(403).json({ message: 'Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP.', mustVerify: true });
    }

    if (user.status === 'banned') {
        return res.status(403).json({ message: 'Tài khoản đã bị khóa' });
    }

    // 4. Check Valid Password
    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass) return res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không đúng' });

    // 5. Sign Token
    const token = generateToken(user);

    // Check Onboarding Status
    const nutritionTarget = await UserNutritionTarget.findOne({ where: { user_id: user.id } });
    const isOnboarded = !!nutritionTarget;

    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            avatar: user.avatar,
            is_onboarded: isOnboarded
        }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// --- PB_03: Register Step 1 (Send OTP) ---
exports.register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    // 1. Check exist
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
        return res.status(400).json({ message: 'Email này đã được sử dụng' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 3. Create or Update User (Status: Pending)
    let user = userExists;
    if (!user) {
        user = await User.create({
            email,
            password_hash,
            full_name,
            role: 'user',
            status: 'pending',
            auth_provider: 'local'
        });
    } else {
        // Update existing pending user
        await user.update({
            password_hash,
            full_name,
            // Keep status pending
        });
    }

    // 4. Generate & Save OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Invalidate old OTPs
    await Otp.update({ is_used: true }, { where: { email, type: 'register' } });

    await Otp.create({
        email,
        otp_code: otpCode,
        type: 'register',
        expires_at: expiresAt
    });

    // 5. Send Email
    await sendEmail(email, "Healio - Mã xác thực tài khoản", `Mã OTP của bạn là: ${otpCode}. Mã có hiệu lực trong 2 phút.`);

    console.log(`[DEV] Register OTP for ${email}: ${otpCode}`);

    res.status(200).json({ message: 'Mã OTP đã được gửi về email', email });

  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// --- Resend OTP ---
exports.resendOtp = async (req, res) => {
    try {
        const { email, type } = req.body; // type: 'register' | 'forgot-password'
        
        // Check user
        const user = await User.findOne({ where: { email } });
        if (!user) {
             return res.status(404).json({ message: 'Email chưa được đăng ký' });
        }

        const otpType = type === 'forgot-password' ? 'reset_password' : 'register';

        // Check status for register
        if (otpType === 'register' && user.status === 'active') {
             return res.status(400).json({ message: 'Tài khoản đã được kích hoạt. Vui lòng đăng nhập.' });
        }

        // Generate OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

        // Invalidate old
        await Otp.update({ is_used: true }, { where: { email, type: otpType } });

        await Otp.create({
            email,
            otp_code: otpCode,
            type: otpType,
            expires_at: expiresAt
        });

        // Send Email
        const subject = otpType === 'register' ? "Healio - Mã xác thực tài khoản" : "Healio - Quên mật khẩu";
        const content = `Mã OTP mới của bạn là: ${otpCode}. Mã có hiệu lực trong 2 phút.`;
        
        await sendEmail(email, subject, content);
        console.log(`[DEV] Resend OTP (${otpType}) for ${email}: ${otpCode}`);

        res.json({ message: 'Đã gửi lại mã OTP' });

    } catch (err) {
        console.error('Resend OTP Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// --- PB_03: Register Step 2 (Verify OTP) ---
exports.verifyRegisterOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // 1. Find OTP
        const validOtp = await Otp.findOne({
            where: {
                email,
                otp_code: otp,
                type: 'register',
                is_used: false,
                expires_at: { [Op.gt]: new Date() } // Must be not expired
            }
        });

        if (!validOtp) {
            return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn' });
        }

        // 2. Activate User
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.update({ status: 'active' });
        await validOtp.update({ is_used: true });

        // 3. Auto Login
        const token = generateToken(user);

        res.json({
            message: 'Kích hoạt tài khoản thành công',
            token,
            user: { 
                id: user.id, 
                email: user.email, 
                full_name: user.full_name, 
                role: user.role,
                is_onboarded: false
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- PB_04: Forgot Password Step 1 (Send OTP) ---
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Security: Sometimes we don't want to reveal email existence, but AC1 implies we might.
            // PB_04 doesn't explicitly say check existence but implies flow.
            return res.status(404).json({ message: 'Email này chưa được đăng ký' });
        }

        // Generate OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

        await Otp.update({ is_used: true }, { where: { email, type: 'reset_password' } });
        await Otp.create({
            email,
            otp_code: otpCode,
            type: 'reset_password',
            expires_at: expiresAt
        });

        await sendEmail(email, "Healio - Quên mật khẩu", `Mã xác thực để đặt lại mật khẩu của bạn là: ${otpCode}`);
        
        console.log(`[DEV] ForgotPass OTP for ${email}: ${otpCode}`);

        res.json({ message: 'Mã xác thực đã được gửi' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- PB_04: Forgot Password Step 2 (Reset Password) ---
// Note: Can split into "Verify OTP" screen and "Update Pass" screen.
// But usually one API call at the end or a temp token.
// Requirement PB_04 AC3: "If enter correct OTP -> Switch to Input New Password screen".
// This implies we need an API specifically to just Verify OTP.
exports.verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const validOtp = await Otp.findOne({
            where: {
                email,
                otp_code: otp,
                type: 'reset_password',
                is_used: false,
                expires_at: { [Op.gt]: new Date() }
            }
        });

        if (!validOtp) return res.status(400).json({ message: 'Mã OTP không đúng hoặc hết hạn' });

        res.json({ message: 'Mã OTP hợp lệ' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Verify OTP again (to be safe)
        const validOtp = await Otp.findOne({
            where: {
                email,
                otp_code: otp,
                type: 'reset_password',
                is_used: false,
                expires_at: { [Op.gt]: new Date() }
            }
        });

        if (!validOtp) return res.status(400).json({ message: 'Phiên giao dịch hết hạn, vui lòng thử lại' });

        const user = await User.findOne({ where: { email } });
        
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        await user.update({ password_hash });
        await validOtp.update({ is_used: true }); // Burn OTP

        res.json({ message: 'Đặt lại mật khẩu thành công' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- PB_02: Google Login ---
exports.googleLogin = async (req, res) => {
    try {
        const { email, google_id, full_name, avatar } = req.body;

        if (!email) return res.status(400).json({ message: 'Missing email' });

        let user = await User.findOne({ where: { email } });

        if (user) {
            // Update Google Info if missing
            if (!user.google_id) {
                await user.update({ google_id, avatar, auth_provider: 'google' });
            }
        } else {
            // Register New User (No password)
            user = await User.create({
                email,
                full_name,
                google_id,
                avatar,
                role: 'user',
                status: 'active', // Google users verified by Google
                auth_provider: 'google',
                password_hash: '' // No password
            });
        }

        const token = generateToken(user);

        const nutritionTarget = await UserNutritionTarget.findOne({ where: { user_id: user.id } });
        const isOnboarded = !!nutritionTarget;

        res.json({
            token,
            user: { 
                id: user.id, 
                email: user.email, 
                full_name: user.full_name, 
                role: user.role, 
                avatar: user.avatar,
                is_onboarded: isOnboarded
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Login Admin (Chặn nếu role != admin)
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || user.role !== 'admin') {
            // Bảo mật: Không nên báo rõ là "không phải admin" mà chỉ báo sai thông tin
            return res.status(403).json({ message: 'Truy cập bị từ chối hoặc sai thông tin' });
        }

        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) return res.status(400).json({ message: 'Truy cập bị từ chối hoặc sai thông tin' });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, role: 'admin' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};