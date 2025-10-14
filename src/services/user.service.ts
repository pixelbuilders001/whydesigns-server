import jwt from 'jsonwebtoken';
import userRepository from '../repositories/user.repository';
import roleRepository from '../repositories/role.repository';
import s3Service from './s3.service';
import { IUser } from '../models/user.model';
import { config } from '../config/env.config';
import {
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  BadRequestError,
} from '../utils/AppError';
import { PaginationOptions } from '../types';

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address?: string;
  profilePicture?: string;
}

export class UserService {
  async register(userData: RegisterUserData): Promise<{ user: IUser; token: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await userRepository.existsByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Check if phone number already exists
    const existingPhone = await userRepository.existsByPhone(userData.phoneNumber);
    if (existingPhone) {
      throw new ConflictError('User with this phone number already exists');
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
        isActive: true,
      });
      console.log('✅ USER role created');
    }

    // Create user with USER roleId
    const user = await userRepository.create({
      ...userData,
      roleId: role._id,
      provider: 'local',
    });

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token
    await userRepository.updateRefreshToken(user._id, refreshToken);

    return { user, token, refreshToken };
  }

  async login(email: string, password: string): Promise<{ user: IUser; token: string; refreshToken: string }> {
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
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token
    await userRepository.updateRefreshToken(user._id, refreshToken);

    // Remove sensitive fields from response
    user.password = undefined as any;
    user.refreshToken = undefined as any;

    return { user, token, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_SECRET) as any;

      const user = await userRepository.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Verify stored refresh token matches
      const storedToken = await userRepository.getRefreshToken(user._id);
      if (storedToken !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Update stored refresh token
      await userRepository.updateRefreshToken(user._id, newRefreshToken);

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await userRepository.findByIdWithRole(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getAllUsers(options: PaginationOptions): Promise<{ users: IUser[]; total: number }> {
    return await userRepository.findAll(options);
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser> {
    // Prevent updating sensitive fields
    if (updateData.password || updateData.email || (updateData as any).refreshToken) {
      throw new BadRequestError('Cannot update password, email, or refresh token through this endpoint');
    }

    const user = await userRepository.update(id, updateData);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateProfile(id: string, updateData: Partial<IUser>): Promise<IUser> {
    // Only allow updating specific profile fields
    const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'gender', 'address', 'profilePicture'];
    const filteredData: any = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updateData, field)) {
        filteredData[field] = (updateData as any)[field];
      }
    }

    // Check if phone number is being changed and if it's already in use
    if (filteredData.phoneNumber) {
      const existingPhone = await userRepository.existsByPhone(filteredData.phoneNumber);
      if (existingPhone) {
        const existingUser = await userRepository.findByPhone(filteredData.phoneNumber);
        if (existingUser && existingUser._id.toString() !== id) {
          throw new ConflictError('Phone number is already in use');
        }
      }
    }

    const user = await userRepository.update(id, filteredData);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateProfileWithImage(
    id: string,
    updateData: Partial<IUser>,
    file?: Express.Multer.File
  ): Promise<IUser> {
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

    // Check if phone number is being changed and if it's already in use
    if (filteredData.phoneNumber) {
      const existingPhone = await userRepository.existsByPhone(filteredData.phoneNumber);
      if (existingPhone) {
        const existingUser = await userRepository.findByPhone(filteredData.phoneNumber);
        if (existingUser && existingUser._id.toString() !== id) {
          throw new ConflictError('Phone number is already in use');
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

    return user;
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByIdWithPassword(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();
  }

  async verifyEmail(id: string): Promise<IUser> {
    const user = await userRepository.update(id, { isEmailVerified: true });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async verifyPhone(id: string): Promise<IUser> {
    const user = await userRepository.update(id, { isPhoneVerified: true });
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await userRepository.delete(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
  }

  async softDeleteUser(id: string): Promise<IUser> {
    const user = await userRepository.softDelete(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  private generateToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        roleId: user.roleId,
      },
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_EXPIRE,
      }
    );
  }

  private generateRefreshToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id,
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
