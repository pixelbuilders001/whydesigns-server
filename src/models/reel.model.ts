import mongoose, { Schema, Document } from 'mongoose';

export interface IReel extends Document {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  fileSize: number;
  uploadedBy: mongoose.Types.ObjectId;
  tags?: string[];
  category?: string;
  viewCount: number;
  likeCount: number;
  isPublished: boolean;
  isActive: boolean;
  displayOrder?: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  uploader?: any;
  fileSizeFormatted: string;
  durationFormatted: string;
}

const reelSchema = new Schema<IReel>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 second'],
      max: [180, 'Duration cannot exceed 180 seconds (3 minutes)'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative'],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader ID is required'],
      index: true,
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
    category: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    viewCount: {
      type: Number,
      default: 0,
      min: [0, 'View count cannot be negative'],
    },
    likeCount: {
      type: Number,
      default: 0,
      min: [0, 'Like count cannot be negative'],
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted file size
reelSchema.virtual('fileSizeFormatted').get(function () {
  const bytes = this.fileSize;
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for formatted duration
reelSchema.virtual('durationFormatted').get(function () {
  const seconds = this.duration;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `0:${remainingSeconds.toString().padStart(2, '0')}`;
});

// Indexes for better query performance
reelSchema.index({ createdAt: -1 });
reelSchema.index({ publishedAt: -1 });
reelSchema.index({ viewCount: -1 });
reelSchema.index({ likeCount: -1 });
reelSchema.index({ isPublished: 1, isActive: 1 });
reelSchema.index({ category: 1 });
reelSchema.index({ tags: 1 });
reelSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Populate uploader details before returning
reelSchema.pre('find', function (next) {
  this.populate({
    path: 'uploadedBy',
    select: 'firstName lastName email profilePicture',
  });
  next();
});

reelSchema.pre('findOne', function (next) {
  this.populate({
    path: 'uploadedBy',
    select: 'firstName lastName email profilePicture',
  });
  next();
});

// Set publishedAt date when publishing
reelSchema.pre('save', function (next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Reel = mongoose.model<IReel>('Reel', reelSchema);

export default Reel;
