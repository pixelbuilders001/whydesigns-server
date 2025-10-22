import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  city?: string;
  state?: string;
  country?: string;
  rating: number;
  message: string;
  designation?: string;
  company?: string;
  profileImage?: string;
  isFavorite: boolean;
  isApproved: boolean;
  isActive: boolean;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  displayOrder?: number;
  createdAt: Date;
  updatedAt: Date;
  user?: any;
  fullLocation: string;
}

const testimonialSchema = new Schema<ITestimonial>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional - guests can submit testimonials
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    city: {
      type: String,
      required: false,
      trim: true,
      minlength: [2, 'City must be at least 2 characters long'],
      maxlength: [100, 'City cannot exceed 100 characters'],
    },
    state: {
      type: String,
      required: false,
      trim: true,
      minlength: [2, 'State must be at least 2 characters long'],
      maxlength: [100, 'State cannot exceed 100 characters'],
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
      maxlength: [100, 'Country cannot exceed 100 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5,
    },
    message: {
      type: String,
      required: [true, 'Testimonial message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters long'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters'],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    profileImage: {
      type: String,
      trim: true,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    socialMedia: {
      facebook: {
        type: String,
        trim: true,
        match: [
          /^(https?:\/\/)?(www\.)?facebook\.com\/.+/i,
          'Please provide a valid Facebook URL',
        ],
      },
      instagram: {
        type: String,
        trim: true,
        match: [
          /^(https?:\/\/)?(www\.)?instagram\.com\/.+/i,
          'Please provide a valid Instagram URL',
        ],
      },
      twitter: {
        type: String,
        trim: true,
        match: [
          /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+/i,
          'Please provide a valid Twitter/X URL',
        ],
      },
      linkedin: {
        type: String,
        trim: true,
        match: [
          /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/i,
          'Please provide a valid LinkedIn URL',
        ],
      },
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full location
testimonialSchema.virtual('fullLocation').get(function () {
  return `${this.city}, ${this.state}${this.country ? `, ${this.country}` : ''}`;
});

// Indexes for better query performance
testimonialSchema.index({ rating: -1 });
testimonialSchema.index({ createdAt: -1 });
testimonialSchema.index({ isFavorite: 1, isApproved: 1, isActive: 1 });
testimonialSchema.index({ city: 1, state: 1 });
testimonialSchema.index({ name: 'text', message: 'text' });

// Populate user details before returning
testimonialSchema.pre('find', function (next) {
  this.populate({
    path: 'userId',
    select: 'firstName lastName email profilePicture',
  });
  next();
});

testimonialSchema.pre('findOne', function (next) {
  this.populate({
    path: 'userId',
    select: 'firstName lastName email profilePicture',
  });
  next();
});

const Testimonial = mongoose.model<ITestimonial>('Testimonial', testimonialSchema);

export default Testimonial;
