import multer from 'multer';
import { S3_CONFIG } from '../config/s3.config';
import { BadRequestError } from '../utils/AppError';

// Configure multer to use memory storage (store file in buffer)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file type is allowed
  if (S3_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file type. Allowed types: ${S3_CONFIG.allowedMimeTypes.join(', ')}`));
  }
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: S3_CONFIG.maxFileSize, // 5MB
  },
});

// Single file upload middleware
export const uploadSingle = (fieldName: string) => {
  return upload.single(fieldName);
};

// Multiple files upload middleware
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return upload.array(fieldName, maxCount);
};
