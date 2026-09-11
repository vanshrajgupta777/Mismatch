import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (uri && uri.trim() !== '' && uri !== 'memory') {
    try {
      const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
      console.log(`Connecting to MongoDB at: ${maskedUri}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log('MongoDB connected successfully.');
      return;
    } catch (err) {
      console.warn('Could not connect to configured MONGO_URI:', err.message);
      if (process.env.NODE_ENV === 'production') {
        console.error('Note: If running on Render, ensure MongoDB Atlas Network Access allows 0.0.0.0/0 (anywhere).');
      }
    }
  }

  // Fallback / default: MongoMemoryServer
  try {
    console.log('Starting in-memory MongoDB server (MongoMemoryServer)...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memoryUri = mongoMemoryServer.getUri();
    await mongoose.connect(memoryUri);
    console.log(`In-memory MongoDB started and connected successfully at ${memoryUri}`);
  } catch (error) {
    console.error('Fatal: Failed to connect to any MongoDB instance:', error);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
