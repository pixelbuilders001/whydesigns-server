import { S3Client } from '@aws-sdk/client-s3';

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
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
};

// Material-specific upload configuration
export const MATERIAL_UPLOAD_CONFIG = {
  maxFileSize: 50 * 1024 * 1024, // 50MB for materials
  allowedMimeTypes: [
    // PDF
    'application/pdf',
    // Microsoft Office Documents
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    // Text files
    'text/plain', // .txt
    'text/csv', // .csv
    // Archives
    'application/zip', // .zip
    'application/x-rar-compressed', // .rar
    'application/x-7z-compressed', // .7z
    // Images (for diagrams, illustrations, etc.)
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Other common formats
    'application/json', // .json
    'application/xml', // .xml
    'text/xml', // .xml
  ],
};
