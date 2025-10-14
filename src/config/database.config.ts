import mongoose from 'mongoose';
import { config } from './env.config';

export class Database {
  private static instance: Database;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    try {
      mongoose.set('strictQuery', false);

      await mongoose.connect(config.MONGODB_URI, {
        retryWrites: true,
        w: 'majority',
      });

      console.log('✅ MongoDB connected successfully');

      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected');
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to application termination');
        process.exit(0);
      });
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    await mongoose.connection.close();
  }

  public getConnection() {
    return mongoose.connection;
  }
}

export default Database.getInstance();
