const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const { validateVerifyEmail, validateForgotPassword } = require('../middleware/validationMiddleware');

// OTP Endpoints
router.post('/verify-email', validateVerifyEmail, otpController.verifyEmail);
router.post('/resend-otp', validateForgotPassword, otpController.resendOTP);

module.exports = router;
