import Booking from '../models/Booking';
import Car from '../models/Car';
import { AppError } from '../utils/AppError';

export class BookingService {
  static async createBooking(userId: string, bookingData: any) {
    const { carId, startDate, endDate, pickupMode, dropMode, pickupLocation, dropLocation } = bookingData;

    const car = await Car.findById(carId);
    if (!car || !car.isAvailable) {
      throw new AppError('Vehicle is not available for booking', 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (totalDays <= 0) {
      throw new AppError('Invalid booking dates', 400);
    }

    // 1. Check if the exact booking already exists as PENDING and UNPAID for this user
    const existingPending = await Booking.findOne({
      userId,
      carId,
      startDate: start,
      endDate: end,
      status: 'PENDING',
      paymentStatus: 'UNPAID'
    });

    if (existingPending) {
      const baseAmount = car.pricePerDay * totalDays;
      const pickupCharge = pickupMode === 'DELIVERY' ? 500 : 0;
      const dropCharge = dropMode === 'DELIVERY' ? 500 : 0;
      const taxAmount = baseAmount * 0.18;
      const totalAmount = baseAmount + pickupCharge + dropCharge + taxAmount;

      existingPending.pickupMode = pickupMode;
      existingPending.dropMode = dropMode;
      existingPending.pickupLocation = pickupLocation;
      existingPending.dropLocation = dropLocation;
      existingPending.pickupCharge = pickupCharge;
      existingPending.dropCharge = dropCharge;
      existingPending.taxAmount = taxAmount;
      existingPending.totalAmount = totalAmount;
      await existingPending.save();
      return existingPending;
    }

    // 2. Validate overlapping bookings
    const overlappingBooking = await Booking.findOne({
      carId,
      status: { $in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });
    if (overlappingBooking) {
      throw new AppError('This vehicle is already booked for the selected dates.', 400);
    }

    // Pricing Logic based on Frontend requirements
    const baseAmount = car.pricePerDay * totalDays;
    const pickupCharge = pickupMode === 'DELIVERY' ? 500 : 0; // Example fixed charge
    const dropCharge = dropMode === 'DELIVERY' ? 500 : 0;
    const taxAmount = baseAmount * 0.18; // 18% GST
    const totalAmount = baseAmount + pickupCharge + dropCharge + taxAmount;

    const booking = await Booking.create({
      userId,
      carId,
      startDate: start,
      endDate: end,
      totalDays,
      baseAmount,
      pickupMode,
      dropMode,
      pickupCharge,
      dropCharge,
      taxAmount,
      totalAmount,
      pickupLocation,
      dropLocation,
      status: 'PENDING',
      paymentStatus: 'UNPAID'
    });

    return booking;
  }

  static async getUserBookings(userId: string) {
    return await Booking.find({ userId }).populate('carId').sort({ createdAt: -1 });
  }

  static async getBookingById(id: string, userId?: string) {
    const booking = await Booking.findById(id).populate('carId');
    if (!booking) throw new AppError('Booking not found', 404);

    if (userId && booking.userId.toString() !== userId) {
      throw new AppError('You do not have permission to view this booking', 403);
    }

    return booking;
  }

  static async updateBookingStatus(id: string, status: string) {
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!booking) throw new AppError('Booking not found', 404);

    return booking;
  }

  static async cancelBooking(id: string, userId: string) {
    const booking = await Booking.findOne({ _id: id, userId });
    if (!booking) throw new AppError('Booking not found or unauthorized', 404);

    if (booking.status === 'COMPLETED') {
      throw new AppError('Cannot cancel a completed booking', 400);
    }

    booking.status = 'CANCELLED';
    await booking.save();

    return booking;
  }

  static async getAllBookings() {
    return await Booking.find().populate('userId carId').sort({ createdAt: -1 });
  }
}
