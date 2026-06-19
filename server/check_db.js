const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://chintu:chintu1234@cluster0.odwxhoq.mongodb.net/raino-cars?retryWrites=true&w=majority';

async function checkDb() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    // Get the User collection
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Users in DB:');
    users.forEach(u => {
      console.log(`- Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkDb();
