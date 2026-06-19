export type UserRole = 'USER' | 'ADMIN';
export type PickupDropMode = 'SELF' | 'DELIVERY';
export type UserDocumentType = 'DRIVING_LICENSE' | 'GOVERNMENT_ID' | 'ADDRESS_PROOF' | 'OTHER';

export interface UserDocument {
  id: string;
  userId: string;
  type: UserDocumentType;
  label: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePhoto?: string;
  drivingLicenseUrl?: string;
  documents?: UserDocument[];
  isVerified: boolean;
  createdAt: string;
}

export interface AppSettings {
  hubAddress: string;
  pickupDeliveryCharge: number;
  dropDeliveryCharge: number;
}

export interface Car {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  baseAmount: number;
  pickupMode: PickupDropMode;
  dropMode: PickupDropMode;
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
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  method: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  status: string;
  createdAt: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  carId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link: string;
  createdAt: string;
}
