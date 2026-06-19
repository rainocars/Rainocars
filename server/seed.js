const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/raino-cars';

const USERS = [
  {
    name: 'Raino Admin',
    email: 'rainocars@gmail.com',
    phone: '+91 00000 00000',
    role: 'ADMIN',
    password: 'Pandu@2172',
    isVerified: true
  },
  {
    name: 'John Doe',
    email: 'user@raino.com',
    phone: '+91 98765 43210',
    role: 'USER',
    password: 'User@123',
    isVerified: true
  }
];

const CARS = [
  {
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
    rating: 4.5
  },
  {
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
    rating: 4.8
  }
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // 1. Seed Users
    console.log('Seeding users...');
    const usersCollection = mongoose.connection.db.collection('users');
    await usersCollection.deleteMany({}); // clear existing
    for (const u of USERS) {
      const hashedPassword = await bcrypt.hash(u.password, 12);
      const userDoc = {
        ...u,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await usersCollection.insertOne(userDoc);
      console.log(`- Seeded user: ${u.email}`);
    }

    // 2. Seed Cars
    console.log('Seeding cars...');
    const carsCollection = mongoose.connection.db.collection('cars');
    await carsCollection.deleteMany({}); // clear existing
    for (const c of CARS) {
      const carDoc = {
        ...c,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      await carsCollection.insertOne(carDoc);
      console.log(`- Seeded car: ${c.name}`);
    }

    console.log('Database seeding completed successfully!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
