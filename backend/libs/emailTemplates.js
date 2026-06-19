/**
 * Email templates helper for Raino Cars brand theme (#ef4444 / #000000 / #ffffff)
 */

const getVerificationEmailTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px; margin: 0; width: 100%;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f3;">
        <!-- Header -->
        <div style="background-color: #000000; padding: 25px; text-align: center;">
          <h2 style="color: #ef4444; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 800; letter-spacing: 1px; font-size: 24px;">
            RAINO <span style="color: #ffffff; background-color: #ef4444; padding: 3px 8px; border-radius: 4px; margin-left: 2px;">CARS</span>
          </h2>
        </div>
        <!-- Body -->
        <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
          <h1 style="font-size: 20px; font-weight: 700; color: #111111; margin-top: 0; margin-bottom: 20px;">Verify Your Email</h1>
          <p style="font-size: 15px; margin-bottom: 25px;">Thank you for registering with Raino Cars. To complete your sign-up, please verify your email address. Use the following One-Time Password (OTP) to activate your account:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; font-size: 32px; font-weight: 800; text-align: center; letter-spacing: 6px; padding: 15px 30px; background-color: #fafafa; border: 2px dashed #ef4444; border-radius: 8px; color: #000000; font-family: monospace;">
              ${otp}
            </div>
          </div>

          <p style="font-size: 14px; color: #ef4444; font-weight: 600; margin-bottom: 20px; text-align: center;">
            ⚠️ This code will expire in 10 minutes.
          </p>
          <p style="font-size: 14px; color: #666666; margin-bottom: 0;">If you did not initiate this request, you can safely ignore this email.</p>
        </div>
        <!-- Footer -->
        <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
          <p style="margin: 0 0 10px 0;">Drive the moment with premium service.</p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Raino Cars. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};

const getWelcomeEmailTemplate = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px; margin: 0; width: 100%;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f3;">
        <!-- Header -->
        <div style="background-color: #000000; padding: 25px; text-align: center;">
          <h2 style="color: #ef4444; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 800; letter-spacing: 1px; font-size: 24px;">
            RAINO <span style="color: #ffffff; background-color: #ef4444; padding: 3px 8px; border-radius: 4px; margin-left: 2px;">CARS</span>
          </h2>
        </div>
        <!-- Body -->
        <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
          <h1 style="font-size: 22px; font-weight: 700; color: #111111; margin-top: 0; margin-bottom: 20px;">Welcome to Raino Cars, ${name}!</h1>
          <p style="font-size: 15px; margin-bottom: 20px;">Your account has been successfully verified and activated. We are thrilled to welcome you to our community of car enthusiasts and premium drivers.</p>
          <p style="font-size: 15px; margin-bottom: 30px;">Get ready to explore the city's most exclusive fleet of luxury and sport vehicles. Whether it is a business weekend or a special event, we have the perfect ride for you.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/cars" style="display: inline-block; font-size: 16px; font-weight: bold; text-decoration: none; color: #ffffff; background-color: #ef4444; padding: 15px 35px; border-radius: 8px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2); transition: background-color 0.2s;">
              Explore Available Cars
            </a>
          </div>

          <p style="font-size: 14px; color: #666666; margin-bottom: 0;">If you have any questions or need assistance, our support team is available 24/7 to help you.</p>
        </div>
        <!-- Footer -->
        <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
          <p style="margin: 0 0 10px 0;">Start driving the moment.</p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Raino Cars. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};

const getPasswordResetEmailTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 30px; margin: 0; width: 100%;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f3;">
        <!-- Header -->
        <div style="background-color: #000000; padding: 25px; text-align: center;">
          <h2 style="color: #ef4444; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 800; letter-spacing: 1px; font-size: 24px;">
            RAINO <span style="color: #ffffff; background-color: #ef4444; padding: 3px 8px; border-radius: 4px; margin-left: 2px;">CARS</span>
          </h2>
        </div>
        <!-- Body -->
        <div style="padding: 40px 30px; color: #333333; line-height: 1.6;">
          <h1 style="font-size: 20px; font-weight: 700; color: #111111; margin-top: 0; margin-bottom: 20px;">Reset Your Password</h1>
          <p style="font-size: 15px; margin-bottom: 25px;">We received a request to reset your password. Use the following 6-digit One-Time Password (OTP) to establish a new password for your account:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; font-size: 32px; font-weight: 800; text-align: center; letter-spacing: 6px; padding: 15px 30px; background-color: #fafafa; border: 2px dashed #ef4444; border-radius: 8px; color: #000000; font-family: monospace;">
              ${otp}
            </div>
          </div>

          <p style="font-size: 14px; color: #ef4444; font-weight: 600; margin-bottom: 20px; text-align: center;">
            ⚠️ This code will expire in 10 minutes.
          </p>
          <p style="font-size: 14px; color: #666666; margin-bottom: 0;">If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.</p>
        </div>
        <!-- Footer -->
        <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
          <p style="margin: 0 0 10px 0;">Premium services and secure accounts.</p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Raino Cars. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;
};

module.exports = {
  getVerificationEmailTemplate,
  getWelcomeEmailTemplate,
  getPasswordResetEmailTemplate,
};
