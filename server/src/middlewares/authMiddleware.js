const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // PB_60: Force Logout - Check status from DB immediately
    // This ensures banned users are rejected even if token is valid
    const User = require('../models/User'); // Lazy load to avoid circular dependency if any
    const user = await User.findByPk(verified.id, { attributes: ['status', 'role'] });

    if (!user) {
      return res.status(401).json({ message: 'User verification failed' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa.' });
    }

    req.user = verified; // Lưu payload (id, role) vào req để dùng ở controller
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Invalid or Expired Token' });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access Denied. Admin only.' });
    }
  });
};

module.exports = { verifyToken, verifyAdmin };