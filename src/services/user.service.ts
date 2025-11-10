import jwt from 'jsonwebtoken';
import userRepository from '../repositories/user.repository';
import roleRepository from '../repositories/role.repository';
import s3Service from './s3.service';
import otpService from './otp.service';
import emailService from './email.service';
import leadService from './lead.service';
import { IUser, UserUtils } from '../models/user.model';
import { config } from '../config/env.config';
import {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  BadRequestError,
} from '../utils/AppError';
import { PaginationOptions } from '../types';

export interface RegisterUserData {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  profilePicture?: string;
}

export class UserService {
  async register(userData: RegisterUserData): Promise<{ user: any; token: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await userRepository.existsByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Check if phone number already exists (only if provided)
    if (userData.phoneNumber) {
      const existingPhone = await userRepository.existsByPhone(userData.phoneNumber);
      if (existingPhone) {
        throw new ConflictError('User with this phone number already exists');
      }
    }

    // Get or create USER role
    let role = await roleRepository.findByName('USER');

    // If USER role doesn't exist, create it
    if (!role) {
      console.log('⚠️  USER role not found, creating it...');
      role = await roleRepository.create({
        name: 'USER',
        description: 'Regular user with basic permissions',
        permissions: ['read:own_profile', 'update:own_profile'],
      });
      console.log('✅ USER role created');
    }

    // Create user with USER roleId
    const user = await userRepository.create({
      ...userData,
      roleId: role.id as any,
      provider: 'local',
    });

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token
    await userRepository.updateRefreshToken(user.id, refreshToken);

    // Send OTP for email verification
    try {
      await otpService.createAndSendOTP(
        user.id,
        user.email,
        user.firstName || 'User',
        'email_verification'
      );
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      // Don't fail registration if email sending fails
    }

    // Create a lead for the new user registration
    try {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

      // Use phone number if provided, otherwise use placeholder
      const phoneNumber = user.phoneNumber && user.phoneNumber.trim() !== ''
        ? user.phoneNumber
        : 'Not provided';

      await leadService.createLead({
        fullName,
        email: user.email,
        phone: phoneNumber,
        areaOfInterest: 'New User Registration',
        message: `Automatically created from user registration${!user.phoneNumber ? ' (Phone number not provided during registration)' : ''}`,
      });

      console.log(`✅ Lead created for new user: ${user.email}`);
    } catch (error) {
      console.error('Failed to create lead for new user:', error);
      // Don't fail registration if lead creation fails
    }

    return { user: UserUtils.toResponse(user), token, refreshToken };
  }

  async login(email: string, password: string): Promise<{ user: any; token: string; refreshToken: string }> {
    // Find user by email
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await UserUtils.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token
    await userRepository.updateRefreshToken(user.id, refreshToken);

    return { user: UserUtils.toResponse(user), token, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_SECRET) as any;

      const user = await userRepository.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Verify stored refresh token matches
      const storedToken = await userRepository.getRefreshToken(user.id);
      if (storedToken !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Update stored refresh token
      await userRepository.updateRefreshToken(user.id, newRefreshToken);

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
  }

  async getUserById(id: string): Promise<any> {
    const user = await userRepository.findByIdWithRole(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return UserUtils.toResponse(user);
  }

  async getAllUsers(options: PaginationOptions): Promise<{ users: any[]; total: number }> {
    const result = await userRepository.findAll(options);
    return {
      users: result.users.map(user => UserUtils.toResponse(user)),
      total: result.total
    };
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<any> {
    // Prevent updating sensitive fields
    if (updateData.password || updateData.email || (updateData as any).refreshToken) {
      throw new BadRequestError('Cannot update password, email, or refresh token through this endpoint');
    }

    // Check if phone number is being changed and if it's already in use by another user
    if (updateData.phoneNumber) {
      const existingPhone = await userRepository.existsByPhone(updateData.phoneNumber);
      if (existingPhone) {
        const existingUser = await userRepository.findByPhone(updateData.phoneNumber);
        // If phone exists and belongs to a different user, throw error
        if (existingUser && existingUser.id !== id) {
          throw new ConflictError('Phone number is already in use by another user');
        }
      }
    }

    const user = await userRepository.update(id, updateData);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return UserUtils.toResponse(user);
  }

  async updateProfile(id: string, updateData: Partial<IUser>): Promise<any> {
    // Only allow updating specific profile fields
    const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'gender', 'address', 'profilePicture'];
    const filteredData: any = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        filteredData[field] = (updateData as any)[field];
      }
    }

    // Check if phone number is being changed and if it's already in use by another user
    if (filteredData.phoneNumber) {
      const existingPhone = await userRepository.existsByPhone(filteredData.phoneNumber);
      if (existingPhone) {
        const existingUser = await userRepository.findByPhone(filteredData.phoneNumber);
        // If phone exists and belongs to a different user, throw error
        if (existingUser && existingUser.id !== id) {
          throw new ConflictError('Phone number is already in use by another user');
        }
      }
    }

    const user = await userRepository.update(id, filteredData);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return UserUtils.toResponse(user);
  }

  async updateProfileWithImage(
    id: string,
    updateData: Partial<IUser>,
    file?: Express.Multer.File
  ): Promise<any> {
    // Get current user to check for existing profile picture
    const currentUser = await userRepository.findById(id);
    if (!currentUser) {
      throw new NotFoundError('User not found');
    }

    // Only allow updating specific profile fields
    const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'gender', 'address'];
    const filteredData: any = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        filteredData[field] = (updateData as any)[field];
      }
    }

    // Check if phone number is being changed and if it's already in use by another user
    if (filteredData.phoneNumber) {
      const existingPhone = await userRepository.existsByPhone(filteredData.phoneNumber);
      if (existingPhone) {
        const existingUser = await userRepository.findByPhone(filteredData.phoneNumber);
        // If phone exists and belongs to a different user, throw error
        if (existingUser && existingUser.id !== id) {
          throw new ConflictError('Phone number is already in use by another user');
        }
      }
    }

    // Handle profile picture upload if file is provided
    if (file) {
      // Delete old profile picture from S3 if it exists
      if (currentUser.profilePicture) {
        await s3Service.deleteOldProfilePicture(currentUser.profilePicture);
      }

      // Upload new profile picture to S3
      const profilePictureUrl = await s3Service.uploadProfilePicture(file, id);
      filteredData.profilePicture = profilePictureUrl;
    }

    const user = await userRepository.update(id, filteredData);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return UserUtils.toResponse(user);
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByIdWithPassword(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await UserUtils.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash and update password
    const hashedPassword = await UserUtils.hashPassword(newPassword);
    await userRepository.update(id, { password: hashedPassword } as any);
  }

  async forgotPassword(email: string): Promise<void> {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // For security reasons, don't reveal if user exists or not
      // Just return success to prevent email enumeration attacks
      console.log(`⚠️  Forgot password attempted for non-existent email: ${email}`);
      return;
    }

    // Check if user account is active
    if (!user.isActive) {
      throw new BadRequestError('Account is deactivated. Please contact support.');
    }

    // Check if user registered with social login
    if (user.provider !== 'local') {
      throw new BadRequestError(
        `This account was created using ${user.provider} login. Please use ${user.provider} to sign in.`
      );
    }

    // Create and send OTP for password reset
    try {
      await otpService.createAndSendOTP(
        user.id,
        user.email,
        user.firstName || 'User',
        'password_reset'
      );
      console.log(`✅ Password reset OTP sent to ${email}`);
    } catch (error) {
      console.error('Failed to send password reset OTP:', error);
      throw new BadRequestError('Failed to send password reset email. Please try again later.');
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user account is active
    if (!user.isActive) {
      throw new BadRequestError('Account is deactivated. Please contact support.');
    }

    // Check if user registered with social login
    if (user.provider !== 'local') {
      throw new BadRequestError(
        `This account was created using ${user.provider} login. Please use ${user.provider} to sign in.`
      );
    }

    // Verify OTP
    try {
      await otpService.verifyOTP(user.id, otp, 'password_reset');
    } catch (error) {
      throw error; // Re-throw OTP verification errors
    }

    // Hash new password and update
    const hashedPassword = await UserUtils.hashPassword(newPassword);
    await userRepository.update(user.id, { password: hashedPassword } as any);

    // Invalidate all refresh tokens for security
    await userRepository.updateRefreshToken(user.id, null);

    // Send password changed confirmation email
    try {
      await emailService.sendPasswordChangedEmail(user.email, user.firstName || 'User');
    } catch (error) {
      console.error('Failed to send password changed email:', error);
      // Don't fail the password reset if email fails
    }

    console.log(`✅ Password reset successfully for ${email}`);
  }

  async verifyEmail(otp: string, userId?: string, email?: string): Promise<any> {
    // Get user by ID or email
    let user: IUser | null = null;

    if (userId) {
      user = await userRepository.findById(userId);
    } else if (email) {
      user = await userRepository.findByEmail(email);
    } else {
      throw new BadRequestError('Either userId or email is required');
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestError('Email is already verified');
    }

    // Verify OTP
    await otpService.verifyOTP(user.id, otp, 'email_verification');

    // Update user email verification status
    const updatedUser = await userRepository.update(user.id, { isEmailVerified: true });
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(updatedUser.email, updatedUser.firstName || 'User');
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail verification if welcome email fails
    }

    return UserUtils.toResponse(updatedUser);
  }

  async resendOTP(userId?: string, email?: string): Promise<void> {
    // Get user by ID or email
    let user: IUser | null = null;

    if (userId) {
      user = await userRepository.findById(userId);
    } else if (email) {
      user = await userRepository.findByEmail(email);
    } else {
      throw new BadRequestError('Either userId or email is required');
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestError('Email is already verified');
    }

    await otpService.resendOTP(user.id, user.email, user.firstName || 'User', 'email_verification');
  }

  async verifyPhone(id: string): Promise<any> {
    const user = await userRepository.update(id, { isPhoneVerified: true });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return UserUtils.toResponse(user);
  }

  async deleteUser(id: string): Promise<any> {
    const user = await userRepository.softDelete(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return UserUtils.toResponse(user);
  }

  async softDeleteUser(id: string): Promise<any> {
    const user = await userRepository.softDelete(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return UserUtils.toResponse(user);
  }

  private generateToken(user: IUser): string {
    const options: jwt.SignOptions = {
      expiresIn: config.JWT_EXPIRE as any,
    };
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
      },
      config.JWT_SECRET as string,
      options
    );
  }

  private generateRefreshToken(user: IUser): string {
    return jwt.sign(
      {
        id: user.id,
        type: 'refresh',
      },
      config.JWT_SECRET,
      {
        expiresIn: '30d',
      }
    );
  }
}

export default new UserService();
