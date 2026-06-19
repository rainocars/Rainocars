const validator = require('validator');

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || validator.isEmpty(name.trim())) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }

  if (!password || !validator.isLength(password, { min: 6 })) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
  }

  next();
};

const validateVerifyEmail = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }

  if (!otp || !validator.isLength(otp, { min: 6, max: 6 }) || !validator.isNumeric(otp)) {
    return res.status(400).json({ success: false, message: 'OTP must be a 6-digit numeric code' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }

  if (!password || validator.isEmpty(password)) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  next();
};

const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }

  next();
};

const validateResetPassword = (req, res, next) => {
  const { email, otp, password } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
  }

  if (!otp || !validator.isLength(otp, { min: 6, max: 6 }) || !validator.isNumeric(otp)) {
    return res.status(400).json({ success: false, message: 'OTP must be a 6-digit numeric code' });
  }

  if (!password || !validator.isLength(password, { min: 6 })) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateVerifyEmail,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};
