import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import Payment from '../models/Payment';
import Booking from '../models/Booking';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';
import { EmailService } from '../services/email.service';

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummykeysecret',
  });
};

export class PaymentController {
  static createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    const razorpay = getRazorpayInstance();
    const options = {
      amount: Math.round(booking.totalAmount * 100), // amount in paise
      currency: 'INR',
      receipt: `receipt_${booking._id}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      status: 'success',
      data: { order }
    });
  });

  static verifyPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;
    const userId = (req as AuthRequest).user!.id;

    // Verify signature
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummykeysecret');
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpaySignature) {
      throw new AppError('Payment signature verification failed', 400);
    }

    // Update booking payment status
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    booking.paymentStatus = 'PAID';
    booking.paymentId = razorpayPaymentId;
    booking.status = 'CONFIRMED'; // Automatically confirm booking once paid
    await booking.save();

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      userId,
      amount: booking.totalAmount,
      currency: 'INR',
      method: 'Razorpay',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: 'SUCCESS'
    });

    // Send transaction and confirmation emails
    try {
      const populatedBooking = await Booking.findById(bookingId).populate('userId').populate('carId');
      if (populatedBooking) {
        const userObj = populatedBooking.userId as any;
        const carObj = populatedBooking.carId as any;

        if (userObj && userObj.email) {
          // Send Payment Success Email
          try {
            await EmailService.sendPaymentSuccess(userObj.email, {
              bookingId: bookingId.toString(),
              paymentId: razorpayPaymentId,
              amount: booking.totalAmount,
              method: 'Razorpay'
            });
          } catch (emailErr) {
            console.error('Failed to send payment success email:', emailErr);
          }

          // Send Booking Confirmation Email
          try {
            await EmailService.sendBookingConfirmation(userObj.email, {
              id: bookingId.toString(),
              carName: carObj?.name || 'Vehicle',
              startDate: new Date(booking.startDate).toLocaleDateString(),
              endDate: new Date(booking.endDate).toLocaleDateString(),
              totalAmount: booking.totalAmount,
              pickupLocation: booking.pickupLocation
            });
          } catch (emailErr) {
            console.error('Failed to send booking confirmation email:', emailErr);
          }
        }
      }
    } catch (err) {
      console.error('Failed to retrieve populated booking for email notification:', err);
    }

    res.status(200).json({
      status: 'success',
      message: 'Payment verified successfully',
      data: { payment }
    });
  });

  static handleWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhooksecret';

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== webhookSignature) {
      throw new AppError('Invalid webhook signature', 400);
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const paymentDetails = req.body.payload.payment.entity;
      const orderId = paymentDetails.order_id;
      const paymentId = paymentDetails.id;

      // Sync booking if verifyPayment wasn't completed
      const paymentRecord = await Payment.findOne({ razorpayOrderId: orderId });
      if (!paymentRecord) {
        const booking = await Booking.findOne({ paymentId: { $ne: paymentId } });
        if (booking) {
          booking.paymentStatus = 'PAID';
          booking.paymentId = paymentId;
          booking.status = 'CONFIRMED';
          await booking.save();
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  });

  static refundPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    if (booking.paymentStatus !== 'PAID' || !booking.paymentId) {
      throw new AppError('Booking has not been paid or has no valid payment ID', 400);
    }

    const razorpay = getRazorpayInstance();
    const refund = await razorpay.payments.refund(booking.paymentId, {
      amount: Math.round(booking.totalAmount * 100), // full refund
      speed: 'normal'
    });

    booking.paymentStatus = 'REFUNDED';
    booking.status = 'CANCELLED';
    await booking.save();

    await Payment.findOneAndUpdate(
      { bookingId },
      { status: 'REFUNDED' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Payment refunded successfully',
      data: { refund }
    });
  });

  static getAllPayments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payments = await Payment.find()
      .populate('userId', 'name email')
      .populate('bookingId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: payments.length,
      data: { payments }
    });
  });
}
