const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to mobile number (for registration)
 * @access  Public
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile, isLogin } = req.body;

    // Validate mobile number
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Check if user exists
    let user = await User.findOne({ mobile });

    // For login, user must exist
    if (isLogin && !user) {
      return res.status(404).json({
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'Mobile number not registered. Please register first.'
      });
    }

    // For registration, user must not exist
    if (!isLogin && user) {
      return res.status(400).json({
        status: 'error',
        code: 'USER_EXISTS',
        message: 'Mobile number already registered. Please login instead.'
      });
    }

    // Mock OTP (in production, integrate with SMS service)
    const otp = process.env.MOCK_OTP || '1234';
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Create user for registration
    if (!user) {
      user = new User({
        mobile,
        name: `User_${mobile.slice(-4)}`
      });
    }

    user.lastOTP = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    console.log(`OTP sent to ${mobile}: ${otp}`);

    res.json({
      status: 'success',
      message: 'OTP sent successfully',
      data: {
        mobile,
        expiresIn: 300 // seconds
      }
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send OTP'
    });
  }
});

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and login user
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp, name } = req.body;

    // Validate input
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    if (!otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide OTP'
      });
    }

    // Find user
    let user = await User.findOne({ mobile });

    if (!user || !user.lastOTP) {
      return res.status(400).json({
        status: 'error',
        message: 'Please request OTP first'
      });
    }

    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'OTP has expired. Please request a new one'
      });
    }

    // Verify OTP
    if (user.lastOTP !== otp) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP'
      });
    }

    // Update name if provided (for new registrations)
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Clear OTP after successful verification
    user.lastOTP = null;
    user.otpExpiry = null;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          mobile: user.mobile,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify OTP'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      status: 'success',
      data: {
        user: {
          id: req.user._id,
          mobile: req.user.mobile,
          name: req.user.name,
          role: req.user.role,
          stats: req.user.stats || {
            totalWins: 0,
            totalLosses: 0,
            totalPoints: 0,
            highestBreak: 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get profile'
    });
  }
});

/**
 * @route   GET /api/auth/stats
 * @desc    Get current user stats
 * @access  Private
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Return stats from user model (updated when matches complete)
    const stats = {
      totalWins: req.user.stats?.totalWins || 0,
      totalLosses: req.user.stats?.totalLosses || 0,
      totalPoints: req.user.stats?.totalPoints || 0,
      highestBreak: req.user.stats?.highestBreak || 0,
      totalMatches: (req.user.stats?.totalWins || 0) + (req.user.stats?.totalLosses || 0)
    };

    res.json({
      status: 'success',
      data: { stats }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get stats'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to logout'
    });
  }
});

module.exports = router;
