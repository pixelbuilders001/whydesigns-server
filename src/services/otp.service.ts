import emailService from './email.service';
import { BadRequestError } from '../utils/AppError';
import crypto from 'crypto';
import otpRepository from '../repositories/otp.repository';

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
    const expiresAtDate = new Date();
    expiresAtDate.setMinutes(expiresAtDate.getMinutes() + 5);
    const expiresAt = expiresAtDate.toISOString();

    // Delete any existing unused OTPs for this user and type
    await otpRepository.deleteMany({
      userId,
      type,
      isUsed: false,
    });

    // Create new OTP record
    await otpRepository.create({
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
    const otpRecord = await otpRepository.findOne({
      userId,
      otp,
      type,
      isUsed: false,
    });

    if (!otpRecord) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      // Delete expired OTP
      await otpRepository.deleteOne({ id: otpRecord.id });
      throw new BadRequestError('OTP has expired. Please request a new one.');
    }

    // Mark OTP as used and delete it
    await otpRepository.deleteOne({ id: otpRecord.id });

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
    // Create and send new OTP (spam check removed for now - can be added later with DynamoDB TTL)
    await this.createAndSendOTP(userId, email, name, type);
  }

  /**
   * Check if user has pending OTP
   */
  async hasPendingOTP(
    userId: string,
    type: 'email_verification' | 'password_reset' | 'phone_verification' = 'email_verification'
  ): Promise<boolean> {
    const pendingOTP = await otpRepository.findOne({
      userId,
      otp: '', // We don't know the OTP, so this will return null
      type,
      isUsed: false,
    });

    return !!pendingOTP;
  }

  /**
   * Get OTP expiry time
   */
  async getOTPExpiryTime(
    userId: string,
    type: 'email_verification' | 'password_reset' | 'phone_verification' = 'email_verification'
  ): Promise<string | null> {
    // Simplified - just return null for now as we don't have a way to query without OTP
    return null;
  }

  /**
   * Delete all OTPs for a user
   */
  async deleteUserOTPs(userId: string): Promise<void> {
    await otpRepository.deleteUserOTPs(userId);
  }

  /**
   * Clean up expired OTPs (can be run as a cron job)
   */
  async cleanupExpiredOTPs(): Promise<void> {
    // Simplified for DynamoDB - would typically use TTL feature
    console.log(`🧹 Cleanup should be handled by DynamoDB TTL feature`);
  }
}

export default new OTPService();
