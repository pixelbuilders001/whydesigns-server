import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
  altText?: string;
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  creator?: any;
}

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Banner image URL is required'],
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    altText: {
      type: String,
      trim: true,
      maxlength: [200, 'Alt text cannot exceed 200 characters'],
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
    publishedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
bannerSchema.index({ createdAt: -1 });
bannerSchema.index({ publishedAt: -1 });
bannerSchema.index({ isPublished: 1, isActive: 1 });

// Populate creator details before returning
bannerSchema.pre('find', function (next) {
  this.populate({
    path: 'createdBy',
    select: 'firstName lastName email',
  });
  next();
});

bannerSchema.pre('findOne', function (next) {
  this.populate({
    path: 'createdBy',
    select: 'firstName lastName email',
  });
  next();
});

// Pre-save hook to set publishedAt when publishing
bannerSchema.pre('save', function (next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Transform output to remove __v
bannerSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete (ret as any).__v;
    return ret;
  },
});

const Banner = mongoose.model<IBanner>('Banner', bannerSchema);

export default Banner;
