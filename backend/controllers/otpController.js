const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateOTP = require('../libs/generateOTP');
const transporter = require('../libs/emailConfig');
const { getVerificationEmailTemplate, getWelcomeEmailTemplate } = require('../libs/emailTemplates');

// JWT Token Generator
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Verify user email using OTP
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Verify OTP code
    if (!user.verificationCode || user.verificationCode !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect verification code',
      });
    }

    // Check Expiry
    if (user.verificationCodeExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiresAt = null;
    await user.save();

    // Send Welcome Email
    await transporter.sendMail({
      from: `"Raino Cars" <${process.env.EMAIL_USER || 'no-reply@rainocars.com'}>`,
      to: email,
      subject: 'Welcome to Raino Cars',
      html: getWelcomeEmailTemplate(user.name),
    }).catch(err => console.error(`Error sending welcome email: ${err.message}`));

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
    console.error(`Verify Email Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server verification error. Please try again.',
    });
  }
};

/**
 * @desc    Resend OTP to user email (with 60s cooldown constraint)
 * @route   POST /api/auth/resend-otp
 * @access  Public
 */
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    // Cooldown constraint: Check if code was requested in the last 60 seconds
    if (user.verificationCodeExpiresAt) {
      const timeRemainingMs = user.verificationCodeExpiresAt.getTime() - Date.now();
      const cooldownThresholdMs = 9 * 60 * 1000; // 9 minutes remaining out of 10

      if (timeRemainingMs > cooldownThresholdMs) {
        const waitSeconds = Math.ceil((timeRemainingMs - cooldownThresholdMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSeconds} seconds before resending another OTP.`,
        });
      }
    }

    // Generate and update OTP (10 mins validity)
    const newOtp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = newOtp;
    user.verificationCodeExpiresAt = expiresAt;
    await user.save();

    // Send Verification Email
    await transporter.sendMail({
      from: `"Raino Cars" <${process.env.EMAIL_USER || 'no-reply@rainocars.com'}>`,
      to: email,
      subject: 'Raino Cars - New Verification Code',
      html: getVerificationEmailTemplate(newOtp),
    });

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
    });
  } catch (error) {
    console.error(`Resend OTP Error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server OTP resending error. Please try again.',
    });
  }
};

module.exports = {
  verifyEmail,
  resendOTP,
};
