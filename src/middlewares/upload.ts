import multer from 'multer';
import { S3_CONFIG, MATERIAL_UPLOAD_CONFIG, VIDEO_UPLOAD_CONFIG } from '../config/s3.config';
import { BadRequestError } from '../utils/AppError';

// Configure multer to use memory storage (store file in buffer)
const storage = multer.memoryStorage();

// File filter function for images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file type is allowed
  if (S3_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file type. Allowed types: ${S3_CONFIG.allowedMimeTypes.join(', ')}`));
  }
};

// File filter function for materials (PDF, documents, etc.)
const materialFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file type is allowed for materials
  if (MATERIAL_UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file type for materials. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR, 7Z, and images`));
  }
};

// Create multer upload instance for images
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: S3_CONFIG.maxFileSize, // 5MB
  },
});

// Create multer upload instance for materials
export const materialUpload = multer({
  storage: storage,
  fileFilter: materialFileFilter,
  limits: {
    fileSize: MATERIAL_UPLOAD_CONFIG.maxFileSize, // 50MB
  },
});

// Single file upload middleware for images
export const uploadSingle = (fieldName: string) => {
  return upload.single(fieldName);
};

// Multiple files upload middleware for images
export const uploadMultiple = (fieldName: string, maxCount: number = 5) => {
  return upload.array(fieldName, maxCount);
};

// Single file upload middleware for materials
export const uploadMaterialSingle = (fieldName: string) => {
  return materialUpload.single(fieldName);
};

// Multiple files upload middleware for materials
export const uploadMaterialMultiple = (fieldName: string, maxCount: number = 5) => {
  return materialUpload.array(fieldName, maxCount);
};

// File filter function for videos
const videoFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file type is allowed for videos
  if (VIDEO_UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid video file type. Allowed types: MP4, MOV, AVI, WMV, WebM, FLV, 3GP, MKV`));
  }
};

// Create multer upload instance for videos
export const videoUpload = multer({
  storage: storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: VIDEO_UPLOAD_CONFIG.maxFileSize, // 100MB
  },
});

// Single video upload middleware
export const uploadVideoSingle = (fieldName: string) => {
  return videoUpload.single(fieldName);
};

// Upload middleware for reels (video + optional thumbnail)
export const uploadReelFiles = multer({
  storage: storage,
  limits: {
    fileSize: VIDEO_UPLOAD_CONFIG.maxFileSize, // 100MB for video
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check file field name to determine which filter to use
    if (file.fieldname === 'video') {
      // Video file
      if (VIDEO_UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestError(`Invalid video file type. Allowed types: MP4, MOV, AVI, WMV, WebM, FLV, 3GP, MKV`));
      }
    } else if (file.fieldname === 'thumbnail') {
      // Thumbnail image
      if (S3_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestError(`Invalid thumbnail file type. Allowed types: ${S3_CONFIG.allowedMimeTypes.join(', ')}`));
      }
    } else {
      cb(new BadRequestError('Invalid field name'));
    }
  },
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);

// Upload middleware for videos (video + optional thumbnail)
export const uploadVideoFiles = multer({
  storage: storage,
  limits: {
    fileSize: VIDEO_UPLOAD_CONFIG.maxFileSize, // 100MB for video
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check file field name to determine which filter to use
    if (file.fieldname === 'video') {
      // Video file
      if (VIDEO_UPLOAD_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestError(`Invalid video file type. Allowed types: MP4, MOV, AVI, WMV, WebM, FLV, 3GP, MKV`));
      }
    } else if (file.fieldname === 'thumbnail') {
      // Thumbnail image
      if (S3_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestError(`Invalid thumbnail file type. Allowed types: ${S3_CONFIG.allowedMimeTypes.join(', ')}`));
      }
    } else {
      cb(new BadRequestError('Invalid field name'));
    }
  },
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]);
