import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  baseAmount: number;
  pickupMode: 'SELF' | 'DELIVERY';
  dropMode: 'SELF' | 'DELIVERY';
  pickupCharge: number;
  dropCharge: number;
  taxAmount: number;
  totalAmount: number;
  pickupLocation: string;
  dropLocation: string;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  paymentId?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  carId: { type: Schema.Types.ObjectId, ref: 'Car', required: true, index: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalDays: { type: Number, required: true },
  baseAmount: { type: Number, required: true },
  pickupMode: {
    type: String,
    enum: ['SELF', 'DELIVERY'],
    required: true
  },
  dropMode: {
    type: String,
    enum: ['SELF', 'DELIVERY'],
    required: true
  },
  pickupCharge: { type: Number, default: 0 },
  dropCharge: { type: Number, default: 0 },
  taxAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PAID', 'REFUNDED'],
    default: 'UNPAID',
    index: true
  },
  paymentId: { type: String },
  specialRequests: { type: String },
}, {
  timestamps: true
});

export default mongoose.model<IBooking>('Booking', BookingSchema);
