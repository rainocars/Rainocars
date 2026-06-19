import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.get('/user/:userId', NotificationController.getNotifications);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
