const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateOTP = require('../libs/generateOTP');
const transporter = require('../libs/emailConfig');
const { getVerificationEmailTemplate, getPasswordResetEmailTemplate } = require('../libs/emailTemplates');

// JWT Token Generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Register a new user & Send OTP
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already in use',
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate OTP & Expiry (10 minutes)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create User
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode: otp,
      verificationCodeExpiresAt: expiresAt,
    });

    await user.save();

    // Send Verification Email
    await transporter.sendMail({
      from: `"Raino Cars" <${process.env.EMAIL_USER || 'no-reply@rainocars.com'}>`,
      to: email,
      subject: 'Raino Cars - Verify Your Email Address',
      html: getVerificationEmailTemplate(otp),
    });

    res.status(201).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error(`Register Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server registration error. Please try again.',
    });
  }
};

/**
 * @desc    Login user & check verification
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password',
      });
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password',
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first',
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server login error. Please try again.',
    });
  }
};

/**
 * @desc    Request forgot password OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate Reset OTP (10 mins expiry)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = otp;
    user.verificationCodeExpiresAt = expiresAt;
    await user.save();

    // Send Password Reset OTP Email
    await transporter.sendMail({
      from: `"Raino Cars" <${process.env.EMAIL_USER || 'no-reply@rainocars.com'}>`,
      to: email,
      subject: 'Raino Cars - Reset Password Verification Code',
      html: getPasswordResetEmailTemplate(otp),
    });

    res.status(200).json({
      success: true,
      message: 'Reset OTP sent successfully',
    });
  } catch (error) {
    console.error(`Forgot Password Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server forgot-password error. Please try again.',
    });
  }
};

/**
 * @desc    Reset password using OTP
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify OTP code & check expiry
    if (!user.verificationCode || user.verificationCode !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect verification code',
      });
    }

    if (user.verificationCodeExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);

    // Clear verification columns
    user.verificationCode = null;
    user.verificationCodeExpiresAt = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login.',
    });
  } catch (error) {
    console.error(`Reset Password Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server reset-password error. Please try again.',
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
