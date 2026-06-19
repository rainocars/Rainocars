import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';

export class BookingController {
  static createBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const booking = await BookingService.createBooking(userId, req.body);

    res.status(201).json({
      status: 'success',
      message: 'Booking request created successfully',
      data: { booking }
    });
  });

  static myBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const bookings = await BookingService.getUserBookings(userId);

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });
  });

  static getBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const booking = await BookingService.getBookingById(req.params.id, userId);

    res.status(200).json({
      status: 'success',
      data: { booking }
    });
  });

  static cancelBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as AuthRequest).user!.id;
    const booking = await BookingService.cancelBooking(req.params.id, userId);

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  });

  static adminGetAllBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const bookings = await BookingService.getAllBookings();

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings }
    });
  });

  static adminUpdateStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.body;
    const booking = await BookingService.updateBookingStatus(req.params.id, status);

    res.status(200).json({
      status: 'success',
      message: `Booking status updated to ${status}`,
      data: { booking }
    });
  });
}
