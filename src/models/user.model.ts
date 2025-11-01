import { BaseModel } from './base.model';
import bcrypt from 'bcryptjs';

export interface IUser extends BaseModel {
  _id: string; // UUID - Primary Key
  firstName?: string;
  lastName?: string;
  roleId: string; // UUID reference to Role
  dateOfBirth?: string; // ISO 8601 date
  email: string;
  password: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  address?: string;
  profilePicture?: string;
  refreshToken: string | null;
  provider: 'google' | 'facebook' | 'local';
  gender?: 'male' | 'female' | 'other';
}

// User creation input (without auto-generated fields)
export interface CreateUserInput {
  firstName?: string;
  lastName?: string;
  roleId: string;
  dateOfBirth?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  address?: string;
  profilePicture?: string;
  provider?: 'google' | 'facebook' | 'local';
  gender?: 'male' | 'female' | 'other';
}

// User update input
export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  roleId?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  address?: string;
  profilePicture?: string;
  gender?: 'male' | 'female' | 'other';
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isActive?: boolean;
  refreshToken?: string | null;
}

// User response (without sensitive fields)
export interface UserResponse extends Omit<IUser, 'password' | 'refreshToken'> {
  fullName: string;
}

// Utility functions
export class UserUtils {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  // Compare password
  static async comparePassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Get full name
  static getFullName(user: IUser): string {
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'User';
  }

  // Convert to response (remove sensitive fields)
  static toResponse(user: IUser): UserResponse {
    const { password, refreshToken, ...userWithoutSensitive } = user;
    return {
      ...userWithoutSensitive,
      fullName: this.getFullName(user),
    };
  }
}
