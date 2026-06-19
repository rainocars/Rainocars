import { Car, Booking, User, Notification, AppSettings, PickupDropMode } from '@/types';
import { MOCK_CARS, MOCK_ADMIN } from '@/utils/mockData';

const KEYS = {
  cars: 'raino_cars',
  bookings: 'raino_bookings',
  users: 'raino_users',
  notifications: 'raino_notifications',
  auth: 'raino_auth',
  bookingDraft: 'raino_booking_draft',
  settings: 'raino_settings',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  hubAddress: 'Raino Cars Hub, Indiranagar, Bengaluru',
  pickupDeliveryCharge: 500,
  dropDeliveryCharge: 500,
};

export interface StoredUser extends User {
  password: string;
}

export interface BookingDraft {
  carId: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  dropLocation: string;
  pickupMode: PickupDropMode;
  dropMode: PickupDropMode;
  specialRequests?: string;
  totalDays: number;
  baseAmount: number;
  pickupCharge: number;
  dropCharge: number;
  tax: number;
  grandTotal: number;
}

function migrateBooking(b: Booking): Booking {
  const base = b.baseAmount ?? (b as Booking & { totalAmount: number }).totalAmount ?? 0;
  return {
    ...b,
    baseAmount: base,
    pickupMode: b.pickupMode ?? 'DELIVERY',
    dropMode: b.dropMode ?? 'DELIVERY',
    pickupCharge: b.pickupCharge ?? 0,
    dropCharge: b.dropCharge ?? 0,
    taxAmount: b.taxAmount ?? Math.round(base * 0.18),
    totalAmount: b.totalAmount,
  };
}

const DEMO_USERS: StoredUser[] = [
  {
    ...MOCK_ADMIN,
    email: 'admin@rainocars.com',
    password: 'Admin@123',
  },
  {
    id: 'u1',
    name: 'John Doe',
    email: 'user@raino.com',
    phone: '+91 98765 43210',
    role: 'USER',
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    password: 'User@123',
  },
];

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'B102',
    userId: 'u1',
    carId: '2',
    startDate: '2026-06-12',
    endDate: '2026-06-15',
    totalDays: 3,
    baseAmount: 6600,
    pickupMode: 'DELIVERY',
    dropMode: 'DELIVERY',
    pickupCharge: 500,
    dropCharge: 500,
    taxAmount: 1368,
    totalAmount: 8968,
    pickupLocation: 'Indiranagar, Bengaluru',
    dropLocation: 'Koramangala, Bengaluru',
    status: 'PENDING',
    paymentStatus: 'PAID',
    paymentId: 'pay_demo_102',
    specialRequests: 'Full tank please',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function initializeStorage(): void {
  if (!localStorage.getItem(KEYS.cars)) {
    write(KEYS.cars, MOCK_CARS);
  }
  if (!localStorage.getItem(KEYS.users)) {
    write(KEYS.users, DEMO_USERS);
  }
  if (!localStorage.getItem(KEYS.bookings)) {
    write(KEYS.bookings, SEED_BOOKINGS);
  }
  if (!localStorage.getItem(KEYS.notifications)) {
    write(KEYS.notifications, [] as Notification[]);
  }
  if (!localStorage.getItem(KEYS.settings)) {
    write(KEYS.settings, DEFAULT_SETTINGS);
  }
  const bookings = read<Booking[]>(KEYS.bookings, SEED_BOOKINGS);
  write(KEYS.bookings, bookings.map(migrateBooking));
}

export const storage = {
  getCars: (): Car[] => read(KEYS.cars, MOCK_CARS),
  setCars: (cars: Car[]) => write(KEYS.cars, cars),

  getBookings: (): Booking[] => read<Booking[]>(KEYS.bookings, []).map(migrateBooking),
  setBookings: (bookings: Booking[]) => write(KEYS.bookings, bookings),

  getUsers: (): StoredUser[] => read(KEYS.users, DEMO_USERS),
  setUsers: (users: StoredUser[]) => write(KEYS.users, users),

  getNotifications: (): Notification[] => read(KEYS.notifications, []),
  setNotifications: (n: Notification[]) => write(KEYS.notifications, n),

  getAuthUserId: (): string | null => read<string | null>(KEYS.auth, null),
  setAuthUserId: (id: string | null) => write(KEYS.auth, id),

  getBookingDraft: (): BookingDraft | null => read<BookingDraft | null>(KEYS.bookingDraft, null),
  setBookingDraft: (draft: BookingDraft | null) => write(KEYS.bookingDraft, draft),

  getSettings: (): AppSettings => read(KEYS.settings, DEFAULT_SETTINGS),
  setSettings: (settings: AppSettings) => write(KEYS.settings, settings),
};

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
