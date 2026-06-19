import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// Webhook endpoint (Public - signature is verified internally in controller)
router.post('/webhook', PaymentController.handleWebhook);

// Protected routes (User session required)
router.use(protect);
router.post('/create-order', PaymentController.createOrder);
router.post('/verify', PaymentController.verifyPayment);

// Admin-only refund trigger
router.post('/refund', restrictTo('ADMIN'), PaymentController.refundPayment);

export default router;
