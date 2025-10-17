import mongoose, { Document, Schema } from 'mongoose';

/**
 * Material Interface
 * Represents a downloadable material (PDF, documents, etc.)
 */
export interface IMaterial extends Document {
  _id: string;
  name: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category?: string;
  tags: string[];
  uploadedBy: mongoose.Types.ObjectId;
  downloadCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Material Schema
 */
const materialSchema = new Schema<IMaterial>(
  {
    name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
      minlength: [2, 'Material name must be at least 2 characters'],
      maxlength: [200, 'Material name must not exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must not exceed 1000 characters'],
      default: '',
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      trim: true,
      lowercase: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size must be a positive number'],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'Category must not exceed 100 characters'],
      default: 'General',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader information is required'],
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: [0, 'Download count cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for query optimization
materialSchema.index({ name: 1 });
materialSchema.index({ category: 1 });
materialSchema.index({ tags: 1 });
materialSchema.index({ isActive: 1 });
materialSchema.index({ createdAt: -1 });
materialSchema.index({ uploadedBy: 1 });
materialSchema.index({ fileType: 1 });

// Compound index for category + active
materialSchema.index({ category: 1, isActive: 1 });

// Text index for search functionality
materialSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for file size in human-readable format
materialSchema.virtual('fileSizeFormatted').get(function (this: IMaterial) {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual to populate uploader info
materialSchema.virtual('uploader', {
  ref: 'User',
  localField: 'uploadedBy',
  foreignField: '_id',
  justOne: true,
});

/**
 * Export Material Model
 */
export const Material = mongoose.model<IMaterial>('Material', materialSchema);
