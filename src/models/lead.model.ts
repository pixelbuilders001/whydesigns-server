import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  fullName: string;
  email: string;
  phone: string;
  areaOfInterest: string;
  message?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters long'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
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
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [
        /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
        'Please provide a valid phone number',
      ],
    },
    areaOfInterest: {
      type: String,
      required: [true, 'Area of interest is required'],
      trim: true,
      maxlength: [200, 'Area of interest cannot exceed 200 characters'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
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
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ isActive: 1 });
leadSchema.index({ fullName: 'text', areaOfInterest: 'text' });

const Lead = mongoose.model<ILead>('Lead', leadSchema);

export default Lead;
