import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { AppError } from '../utils/AppError';

export class AuthService {
  private static get ACCESS_TOKEN_SECRET() {
    return process.env.JWT_ACCESS_SECRET!;
  }
  private static get REFRESH_TOKEN_SECRET() {
    return process.env.JWT_REFRESH_SECRET!;
  }

  static async registerUser(userData: any) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const user = await User.create({
      ...userData,
      password: hashedPassword,
      isVerified: true,
    });

    return user;
  }

  static async loginUser(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }

    return user;
  }

  static generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign(
      { id: userId, role },
      this.ACCESS_TOKEN_SECRET,
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any }
    );

    const refreshToken = jwt.sign(
      { id: userId },
      this.REFRESH_TOKEN_SECRET,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
    );

    return { accessToken, refreshToken };
  }

  static async verifyRefreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as { id: string };
      const user = await User.findById(decoded.id);
      if (!user) throw new AppError('User no longer exists', 404);
      return user;
    } catch (err) {
      throw new AppError('Invalid refresh token', 401);
    }
  }
}
