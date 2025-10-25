import counselorRepository from '../repositories/counselor.repository';
import { ICounselor } from '../models/counselor.model';
import { PaginationOptions } from '../types';
import { NotFoundError, BadRequestError } from '../utils/AppError';

interface CreateCounselorData {
  fullName: string;
  email: string;
  title: string;
  yearsOfExperience: number;
  bio: string;
  avatarUrl?: string;
  specialties: string[];
  isActive?: boolean;
  rating?: number;
}

interface UpdateCounselorData {
  fullName?: string;
  email?: string;
  title?: string;
  yearsOfExperience?: number;
  bio?: string;
  avatarUrl?: string;
  specialties?: string[];
  isActive?: boolean;
  rating?: number;
}

export class CounselorService {
  async createCounselor(data: CreateCounselorData): Promise<ICounselor> {
    const {
      fullName,
      email,
      title,
      yearsOfExperience,
      bio,
      avatarUrl,
      specialties,
      isActive,
      rating,
    } = data;

    // Validate specialties
    if (!specialties || specialties.length === 0) {
      throw new BadRequestError('At least one specialty is required');
    }

    // Create counselor
    const counselor = await counselorRepository.create({
      fullName,
      email,
      title,
      yearsOfExperience,
      bio,
      avatarUrl: avatarUrl || '',
      specialties,
      isActive: isActive !== undefined ? isActive : true,
      rating: rating !== undefined ? rating : 0,
    });

    return counselor;
  }

  async getAllCounselors(options: PaginationOptions, filters: { isActive?: boolean } = {}): Promise<{ counselors: ICounselor[]; total: number }> {
    return await counselorRepository.findAll(options, filters);
  }

  async getCounselorById(id: string): Promise<ICounselor> {
    const counselor = await counselorRepository.findById(id);
    if (!counselor) {
      throw new NotFoundError('Counselor not found');
    }
    return counselor;
  }

  async updateCounselor(id: string, data: UpdateCounselorData): Promise<ICounselor> {
    const {
      fullName,
      email,
      title,
      yearsOfExperience,
      bio,
      avatarUrl,
      specialties,
      isActive,
      rating,
    } = data;

    // Check if counselor exists
    const existingCounselor = await counselorRepository.findById(id);
    if (!existingCounselor) {
      throw new NotFoundError('Counselor not found');
    }

    // Validate specialties if provided
    if (specialties && specialties.length === 0) {
      throw new BadRequestError('At least one specialty is required');
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 0 || rating > 5)) {
      throw new BadRequestError('Rating must be between 0 and 5');
    }

    // Update counselor
    const updateData: Partial<ICounselor> = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (title !== undefined) updateData.title = title;
    if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
    if (bio !== undefined) updateData.bio = bio;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (specialties !== undefined) updateData.specialties = specialties;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (rating !== undefined) updateData.rating = rating;

    const updatedCounselor = await counselorRepository.update(id, updateData);
    if (!updatedCounselor) {
      throw new NotFoundError('Counselor not found');
    }

    return updatedCounselor;
  }

  async deleteCounselor(id: string): Promise<void> {
    const counselor = await counselorRepository.findById(id);
    if (!counselor) {
      throw new NotFoundError('Counselor not found');
    }

    await counselorRepository.hardDelete(id);
  }

  async softDeleteCounselor(id: string): Promise<ICounselor> {
    const counselor = await counselorRepository.findById(id);
    if (!counselor) {
      throw new NotFoundError('Counselor not found');
    }

    const deletedCounselor = await counselorRepository.softDelete(id);
    if (!deletedCounselor) {
      throw new NotFoundError('Counselor not found');
    }

    return deletedCounselor;
  }

  async searchCounselors(query: string, options: PaginationOptions): Promise<{ counselors: ICounselor[]; total: number }> {
    if (!query || query.trim() === '') {
      throw new BadRequestError('Search query is required');
    }
    return await counselorRepository.search(query, options);
  }

  async getCounselorsBySpecialty(specialty: string, options: PaginationOptions): Promise<{ counselors: ICounselor[]; total: number }> {
    if (!specialty || specialty.trim() === '') {
      throw new BadRequestError('Specialty is required');
    }
    return await counselorRepository.findBySpecialty(specialty, options);
  }

  async getTopRatedCounselors(limit: number = 10): Promise<ICounselor[]> {
    if (limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }
    return await counselorRepository.findTopRated(limit);
  }

  async getMostExperiencedCounselors(limit: number = 10): Promise<ICounselor[]> {
    if (limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be between 1 and 100');
    }
    return await counselorRepository.findMostExperienced(limit);
  }

  async updateCounselorRating(id: string, rating: number): Promise<ICounselor> {
    if (rating < 0 || rating > 5) {
      throw new BadRequestError('Rating must be between 0 and 5');
    }

    const counselor = await counselorRepository.findById(id);
    if (!counselor) {
      throw new NotFoundError('Counselor not found');
    }

    const updatedCounselor = await counselorRepository.update(id, { rating });
    if (!updatedCounselor) {
      throw new NotFoundError('Counselor not found');
    }

    return updatedCounselor;
  }

  async getAllSpecialties(): Promise<string[]> {
    return await counselorRepository.getAllSpecialties();
  }

  async getCounselorStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    averageRating: number;
    totalSpecialties: number;
  }> {
    const [active, inactive, averageRating, specialties] = await Promise.all([
      counselorRepository.countActive(),
      counselorRepository.countInactive(),
      counselorRepository.getAverageRating(),
      counselorRepository.getAllSpecialties(),
    ]);

    return {
      total: active + inactive,
      active,
      inactive,
      averageRating: Math.round(averageRating * 100) / 100,
      totalSpecialties: specialties.length,
    };
  }
}

export default new CounselorService();
