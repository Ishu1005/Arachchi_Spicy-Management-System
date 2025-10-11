const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

/**
 * connectDB - Connect to MongoDB using MONGO_URI from environment
 * Exports an async function that resolves when connected or throws on error.
 */
async function connectDB() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI is not defined in environment');
    }

    try {
        // Use the new URL parser and unified topology by default in recent mongoose
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message || err);
        throw err;
    }
}

module.exports = { connectDB };
