import mongoose, { Schema, Document } from 'mongoose';

export interface IBannerItem {
  imageUrl: string;
  link?: string;
  altText?: string;
  displayOrder: number;
}

export interface IBanner extends Document {
  title: string;
  description?: string;
  banners: IBannerItem[];
  isPublished: boolean;
  isActive: boolean;
  publishedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  creator?: any;
  totalBanners: number;
}

const bannerItemSchema = new Schema<IBannerItem>(
  {
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
    displayOrder: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, 'Banner group title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    banners: {
      type: [bannerItemSchema],
      required: [true, 'At least one banner is required'],
      validate: {
        validator: function (banners: IBannerItem[]) {
          return banners.length >= 1 && banners.length <= 10;
        },
        message: 'Banner group must have between 1 and 10 banners',
      },
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

// Virtual for total banners count
bannerSchema.virtual('totalBanners').get(function () {
  return this.banners?.length || 0;
});

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
