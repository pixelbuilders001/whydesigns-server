import { Schema, model, Document } from 'mongoose';

export interface IOTP extends Document {
  _id: string;
  userId: Schema.Types.ObjectId;
  email: string;
  otp: string;
  type: 'email_verification' | 'password_reset' | 'phone_verification';
  isUsed: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      length: 6,
    },
    type: {
      type: String,
      enum: ['email_verification', 'password_reset', 'phone_verification'],
      default: 'email_verification',
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
otpSchema.index({ userId: 1, type: 1 });
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// Method to check if OTP is expired
otpSchema.methods.isExpired = function (): boolean {
  return new Date() > this.expiresAt;
};

// Static method to clean up expired OTPs (optional, as TTL index handles this)
otpSchema.statics.cleanupExpired = async function (): Promise<void> {
  await this.deleteMany({ expiresAt: { $lt: new Date() } });
};

export const OTP = model<IOTP>('OTP', otpSchema);
