import { S3Client } from '@aws-sdk/client-s3';
import { config } from './env.config';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const S3_CONFIG = {
  bucketName: process.env.AWS_S3_BUCKET_NAME || '',
  region: process.env.AWS_REGION || 'us-east-1',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
};
