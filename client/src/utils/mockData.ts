import { Car, User, Booking } from '@/types';

export const MOCK_CARS: Car[] = [
  {
    id: '1',
    name: 'Tata Altroz',
    slug: 'tata-altroz',
    brand: 'Tata',
    model: 'Altroz',
    year: 2023,
    category: 'Hatchback',
    fuelType: 'Petrol',
    transmission: 'Manual',
    seats: 5,
    pricePerDay: 1200,
    weeklyDiscount: 800,
    monthlyDiscount: 650,
    description: 'The Tata Altroz is a premium hatchback that offers safety, style and comfort. Perfect for city commutes.',
    features: ['AC', 'Bluetooth', 'Reverse Camera', 'ABS', 'Power Steering'],
    images: [
      'https://images.unsplash.com/photo-1542362530-c37d3fd6fbfe?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1619779303171-492913019482?q=80&w=800&auto=format&fit=crop'
    ],
    isAvailable: true,
    totalBookings: 45,
    rating: 4.5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Hyundai Creta',
    slug: 'hyundai-creta',
    brand: 'Hyundai',
    model: 'Creta',
    year: 2023,
    category: 'SUV',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    seats: 5,
    pricePerDay: 2200,
    weeklyDiscount: 1800,
    monthlyDiscount: 1500,
    description: 'The Hyundai Creta is a versatile SUV with premium features and a commanding presence on the road.',
    features: ['AC', 'Sunroof', 'Android Auto', 'Apple CarPlay', 'Wireless Charging', '360 Camera'],
    images: [
      'https://images.unsplash.com/photo-1533473359318-7f47897f639a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618843479337-351266668a9a?q=80&w=800&auto=format&fit=crop'
    ],
    isAvailable: true,
    totalBookings: 82,
    rating: 4.8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_USER: User = {
  id: 'u1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+91 98765 43210',
  role: 'USER',
  isVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
};

export const MOCK_ADMIN: User = {
  id: 'a1',
  name: 'Raino Admin',
  email: 'admin@rainocars.com',
  phone: '+91 00000 00000',
  role: 'ADMIN',
  isVerified: true,
  createdAt: '2023-01-01T00:00:00Z',
};
