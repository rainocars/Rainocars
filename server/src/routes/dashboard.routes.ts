import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { UserController } from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// User Dashboard
router.use(protect);
router.get('/user/overview', DashboardController.getUserOverview);
router.patch('/user/profile', DashboardController.updateUserProfile);

// Admin Dashboard
router.get('/admin/stats', protect, restrictTo('ADMIN'), DashboardController.getAdminStats);
router.get('/admin/users', protect, restrictTo('ADMIN'), UserController.getAdminUsers);

export default router;
