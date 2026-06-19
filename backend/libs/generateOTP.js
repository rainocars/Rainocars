const crypto = require('crypto');

/**
 * Generates a cryptographically secure, random 6-digit numeric OTP.
 * @returns {string} 6-digit OTP code (e.g., '583912')
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

module.exports = generateOTP;
