// NOTE: OTP service still uses Mongoose and needs to be migrated to DynamoDB
// Temporarily using any type to avoid compilation errors
import emailService from './email.service';
import { BadRequestError } from '../utils/AppError';
import crypto from 'crypto';

// Placeholder for Mongoose OTP model during migration
const OTP: any = {
  deleteMany: async () => ({ deletedCount: 0 }),
  create: async () => ({}),
  findOne: async () => null,
  deleteOne: async () => ({}),
};

export class OTPService {
  /**
   * Generate a 6-digit OTP
   */
  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Create and send OTP for email verification
   */
  async createAndSendOTP(
    userId: string,
    email: string,
    name: string,
    type: 'email_verification' | 'password_reset' | 'phone_verification' = 'email_verification'
  ): Promise<void> {
    // Generate OTP
    const otp = this.generateOTP();

    // Set expiry to 5 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Delete any existing unused OTPs for this user and type
    await OTP.deleteMany({
      userId,
      type,
      isUsed: false,
    });

    // Create new OTP record
    await OTP.create({
      userId,
      email,
      otp,
      type,
      expiresAt,
      isUsed: false,
    });

    // Send OTP via email
    await emailService.sendOTPEmail(email, otp, name);

    console.log(`✅ OTP created and sent to ${email}`);
  }

  /**
   * Verify OTP
   */
  async verifyOTP(
    userId: string,
    otp: string,
    type: 'email_verification' | 'password_reset' | 'phone_verification' = 'email_verification'
  ): Promise<boolean> {
    // Find the OTP
    const otpRecord = await OTP.findOne({
      userId,
      otp,
      type,
      isUsed: false,
    });

    if (!otpRecord) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      // Delete expired OTP
      await OTP.deleteOne({ id: otpRecord.id });
      throw new BadRequestError('OTP has expired. Please request a new one.');
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Delete the used OTP
    await OTP.deleteOne({ id: otpRecord.id });

    console.log(`✅ OTP verified successfully for user: ${userId}`);
    return true;
  }

  /**
   * Resend OTP
   */
  async resendOTP(
    userId: string,
    email: string,
    name: string,
    type: 'email_verification' | 'password_reset' | 'phone_verification' = 'email_verification'
  ): Promise<void> {
    // Check if there's a recent OTP (within last minute to prevent spam)
    const recentOTP = await OTP.findOne({
      userId,
      type,
      createdAt: { $gte: new Date(Date.now() - 60 * 1000) }, // Within last 60 seconds
    });

    if (recentOTP) {
      throw new BadRequestError('Please wait at least 60 seconds before requesting a new OTP');
    }

    // Create and send new OTP
    await this.createAndSendOTP(userId, email, name, type);
  }

  /**
   * Check if user has pending OTP
   */
  async hasPendingOTP(
    userId: string,
    type: 'email_verification' | 'password_reset' | 'phone_verification' = 'email_verification'
  ): Promise<boolean> {
    const pendingOTP = await OTP.findOne({
      userId,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    return !!pendingOTP;
  }

  /**
   * Get OTP expiry time
   */
  async getOTPExpiryTime(
    userId: string,
    type: 'email_verification' | 'password_reset' | 'phone_verification' = 'email_verification'
  ): Promise<Date | null> {
    const otpRecord = await OTP.findOne({
      userId,
      type,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    return otpRecord ? otpRecord.expiresAt : null;
  }

  /**
   * Delete all OTPs for a user
   */
  async deleteUserOTPs(userId: string): Promise<void> {
    await OTP.deleteMany({ userId });
  }

  /**
   * Clean up expired OTPs (can be run as a cron job)
   */
  async cleanupExpiredOTPs(): Promise<void> {
    const result = await OTP.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} expired OTPs`);
  }
}

export default new OTPService();
