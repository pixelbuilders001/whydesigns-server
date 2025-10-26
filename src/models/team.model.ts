import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  designation: string;
  description: string;
  image: string;
  isPublished: boolean;
  isActive: boolean;
  displayOrder?: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
      minlength: [2, 'Designation must be at least 2 characters long'],
      maxlength: [100, 'Designation cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
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

// Indexes for better query performance
teamSchema.index({ createdAt: -1 });
teamSchema.index({ publishedAt: -1 });
teamSchema.index({ isPublished: 1, isActive: 1 });
teamSchema.index({ displayOrder: 1 });
teamSchema.index({ name: 'text', designation: 'text', description: 'text' });

// Set publishedAt date when publishing
teamSchema.pre('save', function (next) {
  if (this.isModified('isPublished') && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Team = mongoose.model<ITeam>('Team', teamSchema);

export default Team;
