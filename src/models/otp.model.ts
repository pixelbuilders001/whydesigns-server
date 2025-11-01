export interface IOTP {
  id: string; // UUID - Primary Key
  userId: string; // User ID
  email: string;
  otp: string; // 6-digit OTP
  type: 'email_verification' | 'password_reset' | 'phone_verification';
  isUsed: boolean;
  expiresAt: string; // ISO 8601 timestamp
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

export interface CreateOTPInput {
  userId: string;
  email: string;
  otp: string;
  type: 'email_verification' | 'password_reset' | 'phone_verification';
  expiresAt: string;
}

export interface UpdateOTPInput {
  isUsed?: boolean;
}

// Utility class for OTP operations
export class OTPUtils {
  // Generate 6-digit OTP
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Get expiration time (default: 10 minutes from now)
  static getExpirationTime(minutes: number = 10): string {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
    return expiresAt.toISOString();
  }

  // Check if OTP is expired
  static isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }
}

export default IOTP;
