const mongoose = require('mongoose');

const connectDB = async (uri) => {
    try {
        const MONGO_URI = uri || 'mongodb://javier:Javier%2399@localhost:27017/vuelos?authSource=admin';
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB conectado');
    } catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;

