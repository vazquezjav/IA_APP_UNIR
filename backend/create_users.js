const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://javier:Javier%2399@localhost:27017/vuelos?authSource=admin';

const createUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const admin = {
            name: 'Admin User',
            email: 'admin@vuelos.com',
            password: 'admin123',
            role: 'admin',
            photoUrl: 'assets/default-user.png'
        };

        const user = {
            name: 'Regular User',
            email: 'user@vuelos.com',
            password: 'user123',
            role: 'user',
            photoUrl: 'assets/default-user.png'
        };

        await User.findOneAndUpdate({ email: admin.email }, admin, { upsert: true, new: true });
        console.log('Admin user created/updated');

        await User.findOneAndUpdate({ email: user.email }, user, { upsert: true, new: true });
        console.log('Regular user created/updated');

        console.log('------------------------------------------------');
        console.log('CREDENTIALS:');
        console.log('Admin: admin@vuelos.com / admin123');
        console.log('User:  user@vuelos.com  / user123');
        console.log('------------------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createUsers();
