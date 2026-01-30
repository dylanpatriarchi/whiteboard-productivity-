import mongoose from 'mongoose';

export const connectDatabase = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB Disconnected');
});

mongoose.connection.on('error', (err) => {
    console.error(`❌ MongoDB Error: ${err}`);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
});
