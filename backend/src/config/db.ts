import mongoose from 'mongoose';
import { config } from './env';

export let isDbConnected = false;

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('bufferCommands', false);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    isDbConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isDbConnected = false;
    console.warn(`[Database] MongoDB offline or unavailable. Operating with high-performance In-Memory Database.`);
  }
};
