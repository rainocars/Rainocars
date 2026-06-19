import mongoose, { Schema, Document } from 'mongoose';

export interface ICar {
  name: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  description: string;
  features: string[];
  images: string[];
  isAvailable: boolean;
  totalBookings: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const CarSchema = new Schema<ICar>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  category: { type: String, required: true },
  fuelType: { type: String, required: true },
  transmission: { type: String, required: true },
  seats: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  weeklyDiscount: { type: Number, required: true },
  monthlyDiscount: { type: Number, required: true },
  description: { type: String, required: true },
  features: [{ type: String }],
  images: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  totalBookings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
}, {
  timestamps: true
});

export default mongoose.model<ICar>('Car', CarSchema);
