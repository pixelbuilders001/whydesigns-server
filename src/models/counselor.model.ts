import mongoose, { Document, Schema } from 'mongoose';

export interface ICounselor extends Document {
  _id: string;
  fullName: string;
  email: string;
  title: string;
  yearsOfExperience: number;
  bio: string;
  avatarUrl: string;
  specialties: string[];
  isActive: boolean;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

const counselorSchema = new Schema<ICounselor>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title must not exceed 100 characters'],
    },
    yearsOfExperience: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Years of experience cannot be negative'],
      max: [100, 'Years of experience must not exceed 100'],
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      trim: true,
      minlength: [10, 'Bio must be at least 10 characters'],
      maxlength: [2000, 'Bio must not exceed 2000 characters'],
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: '',
    },
    specialties: {
      type: [String],
      required: [true, 'At least one specialty is required'],
      validate: {
        validator: function (specialties: string[]) {
          return specialties.length > 0 && specialties.length <= 20;
        },
        message: 'A counselor must have between 1 and 20 specialties',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for better query performance
counselorSchema.index({ email: 1 }, { unique: true });
counselorSchema.index({ fullName: 'text', bio: 'text', title: 'text' }); // Text index for search
counselorSchema.index({ isActive: 1 });
counselorSchema.index({ rating: -1 });
counselorSchema.index({ yearsOfExperience: -1 });
counselorSchema.index({ specialties: 1 });
counselorSchema.index({ createdAt: -1 });

// Virtual for experience level
counselorSchema.virtual('experienceLevel').get(function (this: ICounselor) {
  if (this.yearsOfExperience < 2) return 'Junior';
  if (this.yearsOfExperience < 5) return 'Mid-Level';
  if (this.yearsOfExperience < 10) return 'Senior';
  return 'Expert';
});

export const Counselor = mongoose.model<ICounselor>('Counselor', counselorSchema);
