import User from '../models/User';
import { AppError } from '../utils/AppError';

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  static async updateProfile(userId: string, updateData: any) {
    const { password, role } = updateData;

    // Prevent changing critical fields via profile update
    if (password || role) {
      throw new AppError('These fields cannot be updated through the profile page', 400);
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }
}
