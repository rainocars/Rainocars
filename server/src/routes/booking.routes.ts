import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

// User Routes
router.use(protect);
router.post('/', BookingController.createBooking);
router.get('/my-bookings', BookingController.myBookings);
router.get('/:id', BookingController.getBooking);
router.patch('/:id/cancel', BookingController.cancelBooking);

// Admin Routes
router.patch('/:id/status', protect, restrictTo('ADMIN'), BookingController.adminUpdateStatus);
router.get('/admin/all', protect, restrictTo('ADMIN'), BookingController.adminGetAllBookings);

export default router;
