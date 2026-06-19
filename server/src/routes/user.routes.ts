import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

// User-specific routes
router.get('/:id', UserController.getUser);
router.post('/:userId/documents', UserController.addUserDocument);
router.delete('/:userId/documents/:documentId', UserController.removeUserDocument);

// Admin-specific routes
router.get('/admin/documents', restrictTo('ADMIN'), UserController.getAllUserDocuments);

export default router;
