import dotenv from 'dotenv';
import path from 'path';

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.join(__dirname, '../../', envFile) });

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  BCRYPT_ROUNDS: number;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  TIMEZONE?: string;
  // AWS Configuration
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  DYNAMODB_ENDPOINT?: string; // Optional - for local development
  // AWS SES
  AWS_SES_FROM_EMAIL?: string;
  AWS_SES_FROM_NAME?: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config: EnvConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVariable('PORT', '5000'), 10),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_EXPIRE: getEnvVariable('JWT_EXPIRE', '7d'),
  BCRYPT_ROUNDS: parseInt(getEnvVariable('BCRYPT_ROUNDS', '10'), 10),
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', '*'),
  RATE_LIMIT_WINDOW_MS: parseInt(getEnvVariable('RATE_LIMIT_WINDOW_MS', '900000'), 10), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(getEnvVariable('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  TIMEZONE: process.env.TIMEZONE || 'UTC',
  // AWS Configuration
  AWS_REGION: getEnvVariable('AWS_REGION', 'us-east-1'),
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT, // For local development (e.g., DynamoDB Local)
  // AWS SES
  AWS_SES_FROM_EMAIL: process.env.AWS_SES_FROM_EMAIL,
  AWS_SES_FROM_NAME: process.env.AWS_SES_FROM_NAME || 'Why Designers',
};

export default config;
