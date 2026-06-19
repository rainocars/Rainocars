import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Otp from '../models/Otp';
import { EmailService } from '../services/email.service';
import { AppError } from '../utils/AppError';

const getCookieOptions = (maxAge: number) => {
  const options: any = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge
  };
  if (process.env.NODE_ENV === 'production' && process.env.COOKIE_DOMAIN && process.env.COOKIE_DOMAIN !== 'localhost') {
    options.domain = process.env.COOKIE_DOMAIN;
  }
  return options;
};

export class AuthController {
  static sendOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required', 400);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    // Cooldown check (60s limit)
    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      const timeElapsed = Date.now() - existingOtp.createdAt.getTime();
      const cooldown = 60 * 1000;
      if (timeElapsed < cooldown) {
        const secondsRemaining = Math.ceil((cooldown - timeElapsed) / 1000);
        throw new AppError(`Please wait ${secondsRemaining} seconds before requesting a new code.`, 429);
      }
    }

    // Generate 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    // Upsert the OTP in the database
    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt, failedAttempts: 0, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Dispatch OTP email (run in background to prevent request lag)
    EmailService.sendOtp(email, otp);

    res.status(200).json({
      status: 'success',
      message: 'Verification code sent successfully to your email'
    });
  });

  static register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, password, otp } = req.body;
    if (!otp) throw new AppError('Verification code (OTP) is required', 400);

    // Verify OTP record
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      throw new AppError('No verification code found for this email. Please request a new one.', 400);
    }

    if (otpRecord.otp !== otp) {
      otpRecord.failedAttempts += 1;
      await otpRecord.save();
      if (otpRecord.failedAttempts >= 5) {
        await Otp.deleteOne({ email });
        throw new AppError('Too many failed verification attempts. Please request a new code.', 400);
      }
      throw new AppError('Incorrect verification code', 400);
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ email });
      throw new AppError('Verification code has expired. Please request a new one.', 400);
    }

    // OTP is valid -> Register User
    const user = await AuthService.registerUser({ name, email, phone, password });

    // Clean up OTP record
    await Otp.deleteOne({ email });

    // Send Welcome Email
    try {
      await EmailService.sendWelcomeEmail(user.email, user.name);
    } catch (err) {
      console.error('Failed to send welcome email:', err);
    }

    const { accessToken, refreshToken } = AuthService.generateTokens((user._id as any).toString(), user.role);

    res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000)); // 15 mins
    res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000)); // 7 days

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      }
    });
  });

  static login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, otp } = req.body;
    
    // 1. Verify credentials first
    const user = await AuthService.loginUser(email, password);

    // 2. If OTP is not provided, generate and send it
    if (!otp) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

      await Otp.findOneAndUpdate(
        { email },
        { otp: generatedOtp, expiresAt, failedAttempts: 0, createdAt: new Date() },
        { upsert: true, new: true }
      );

      // Dispatch OTP email (run in background to prevent request lag)
      EmailService.sendOtp(email, generatedOtp);

      return res.status(200).json({
        status: 'otp_required',
        message: 'Verification code sent successfully to your email'
      });
    }

    // 3. If OTP is provided, verify it (no bypass allowed)
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      throw new AppError('No verification code found. Please request a new one.', 400);
    }

    if (otpRecord.otp !== otp) {
      otpRecord.failedAttempts += 1;
      await otpRecord.save();
      if (otpRecord.failedAttempts >= 5) {
        await Otp.deleteOne({ email });
        throw new AppError('Too many failed verification attempts. Please request a new code.', 400);
      }
      throw new AppError('Incorrect verification code', 400);
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ email });
      throw new AppError('Verification code has expired. Please request a new one.', 400);
    }

    // Clean up OTP record
    await Otp.deleteOne({ email });

    // 4. Verification successful, generate tokens and log in
    const { accessToken, refreshToken } = AuthService.generateTokens((user._id as any).toString(), user.role);

    res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      }
    });
  });

  static logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  });

  static refresh = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;
    if (!token) throw new AppError('Refresh token missing', 401);

    const user = await AuthService.verifyRefreshToken(token);
    const { accessToken } = AuthService.generateTokens((user._id as any).toString(), user.role);
    res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
    res.status(200).json({
      status: 'success',
      message: 'Token refreshed',
      data: {
        user: { id: user._id, role: user.role }
      }
    });
  });

  static getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const user = await User.findById(userId).select('-password');

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });

  static forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required', 400);

    const user = await User.findOne({ email });
    if (!user) throw new AppError('User with this email does not exist', 404);

    // Rate-limiting check for password reset OTP (60s)
    const existingOtp = await Otp.findOne({ email });
    if (existingOtp) {
      const timeElapsed = Date.now() - existingOtp.createdAt.getTime();
      const cooldown = 60 * 1000;
      if (timeElapsed < cooldown) {
        const secondsRemaining = Math.ceil((cooldown - timeElapsed) / 1000);
        throw new AppError(`Please wait ${secondsRemaining} seconds before requesting a new code.`, 429);
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

    await Otp.findOneAndUpdate(
      { email },
      { otp, expiresAt, failedAttempts: 0, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send Forgot Password OTP (run in background to prevent request lag)
    EmailService.sendOtp(email, otp);

    res.status(200).json({
      status: 'success',
      message: 'Reset verification code sent to your email'
    });
  });

  static resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      throw new AppError('Email, OTP and new password are required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) throw new AppError('User with this email does not exist', 404);

    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      throw new AppError('No verification code found. Please request a new one.', 400);
    }

    if (otpRecord.otp !== otp) {
      otpRecord.failedAttempts += 1;
      await otpRecord.save();
      if (otpRecord.failedAttempts >= 5) {
        await Otp.deleteOne({ email });
        throw new AppError('Too many failed verification attempts. Please request a new code.', 400);
      }
      throw new AppError('Incorrect verification code', 400);
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteOne({ email });
      throw new AppError('Verification code has expired. Please request a new one.', 400);
    }

    // OTP is valid -> update password
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();

    await Otp.deleteOne({ email });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully. You can now login.'
    });
  });
}
