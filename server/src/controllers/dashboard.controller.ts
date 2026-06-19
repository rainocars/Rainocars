import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { UserService } from '../services/user.service';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';

export class DashboardController {
  static getUserOverview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const overview = await DashboardService.getUserOverview(userId);

    res.status(200).json({
      status: 'success',
      data: { overview }
    });
  });

  static updateUserProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const user = await UserService.updateProfile(userId, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: { user }
    });
  });

  static getAdminStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await DashboardService.getAdminStats();

    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  });
}
