import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';

export class NotificationController {
  static getNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const currentUserId = (req as AuthRequest).user!.id;

    if (userId !== currentUserId) {
      throw new AppError('You are not authorized to view these notifications', 403);
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: { notifications }
    });
  });

  static markAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = (req as AuthRequest).user!.id;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) throw new AppError('Notification not found', 404);

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      data: { notification }
    });
  });
}
