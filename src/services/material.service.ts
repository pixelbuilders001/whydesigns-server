import materialRepository from '../repositories/material.repository';
import { IMaterial } from '../models/material.model';
import { PaginationOptions } from '../types';
import { NotFoundError, BadRequestError } from '../utils/AppError';

/**
 * Interface for creating a material
 */
export interface CreateMaterialData {
  name: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category?: string;
  tags?: string[];
  uploadedBy: string;
}

/**
 * Interface for updating a material
 */
export interface UpdateMaterialData {
  name?: string;
  description?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
  tags?: string[];
  isActive?: boolean;
}

/**
 * Material Service
 * Handles business logic for materials
 */
export class MaterialService {
  /**
   * Create a new material
   */
  async create(data: CreateMaterialData): Promise<IMaterial> {
    // Validate required fields
    if (!data.name) {
      throw new BadRequestError('Material name is required');
    }

    if (!data.fileUrl) {
      throw new BadRequestError('File URL is required');
    }

    if (!data.fileName) {
      throw new BadRequestError('File name is required');
    }

    if (!data.fileType) {
      throw new BadRequestError('File type is required');
    }

    if (!data.fileSize || data.fileSize <= 0) {
      throw new BadRequestError('Valid file size is required');
    }

    if (!data.uploadedBy) {
      throw new BadRequestError('Uploader information is required');
    }

    // Create material
    const material = await materialRepository.create({
      name: data.name.trim(),
      description: data.description?.trim() || '',
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileType: data.fileType.toLowerCase(),
      fileSize: data.fileSize,
      category: data.category?.trim() || 'General',
      tags: data.tags || [],
      uploadedBy: data.uploadedBy as any,
    });

    return material;
  }

  /**
   * Get all materials with pagination
   */
  async getAll(options: PaginationOptions): Promise<{ items: IMaterial[]; total: number }> {
    return await materialRepository.findAll(options);
  }

  /**
   * Get material by ID
   */
  async getById(id: string): Promise<IMaterial> {
    const material = await materialRepository.findById(id);
    if (!material) {
      throw new NotFoundError('Material not found');
    }
    return material;
  }

  /**
   * Get materials by category
   */
  async getByCategory(
    category: string,
    options: PaginationOptions
  ): Promise<{ items: IMaterial[]; total: number }> {
    if (!category) {
      throw new BadRequestError('Category is required');
    }
    return await materialRepository.findByCategory(category, options);
  }

  /**
   * Get materials by tags
   */
  async getByTags(
    tags: string[],
    options: PaginationOptions
  ): Promise<{ items: IMaterial[]; total: number }> {
    if (!tags || tags.length === 0) {
      throw new BadRequestError('At least one tag is required');
    }
    return await materialRepository.findByTags(tags, options);
  }

  /**
   * Search materials
   */
  async search(
    query: string,
    options: PaginationOptions
  ): Promise<{ items: IMaterial[]; total: number }> {
    if (!query || query.trim().length === 0) {
      throw new BadRequestError('Search query is required');
    }
    return await materialRepository.search(query.trim(), options);
  }

  /**
   * Update material
   */
  async update(id: string, data: UpdateMaterialData): Promise<IMaterial> {
    // Check if material exists
    const exists = await materialRepository.findById(id);
    if (!exists) {
      throw new NotFoundError('Material not found');
    }

    // Prepare update data
    const updateData: Partial<IMaterial> = {};

    if (data.name !== undefined) {
      if (data.name.trim().length < 2) {
        throw new BadRequestError('Material name must be at least 2 characters');
      }
      updateData.name = data.name.trim();
    }

    if (data.description !== undefined) {
      updateData.description = data.description.trim();
    }

    if (data.fileUrl !== undefined) {
      updateData.fileUrl = data.fileUrl;
    }

    if (data.fileName !== undefined) {
      updateData.fileName = data.fileName;
    }

    if (data.fileType !== undefined) {
      updateData.fileType = data.fileType.toLowerCase();
    }

    if (data.fileSize !== undefined) {
      if (data.fileSize <= 0) {
        throw new BadRequestError('File size must be positive');
      }
      updateData.fileSize = data.fileSize;
    }

    if (data.category !== undefined) {
      updateData.category = data.category.trim() || 'General';
    }

    if (data.tags !== undefined) {
      updateData.tags = data.tags;
    }

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    // Update material
    const material = await materialRepository.update(id, updateData);
    if (!material) {
      throw new NotFoundError('Material not found');
    }

    return material;
  }

  /**
   * Delete material (hard delete)
   */
  async delete(id: string): Promise<void> {
    const exists = await materialRepository.findById(id);
    if (!exists) {
      throw new NotFoundError('Material not found');
    }

    await materialRepository.delete(id);
  }

  /**
   * Soft delete material
   */
  async softDelete(id: string): Promise<IMaterial> {
    const material = await materialRepository.softDelete(id);
    if (!material) {
      throw new NotFoundError('Material not found');
    }
    return material;
  }

  /**
   * Track download and return material
   */
  async trackDownload(id: string): Promise<IMaterial> {
    const material = await materialRepository.incrementDownloadCount(id);
    if (!material) {
      throw new NotFoundError('Material not found');
    }
    return material;
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    return await materialRepository.getCategories();
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<string[]> {
    return await materialRepository.getTags();
  }

  /**
   * Get statistics by category
   */
  async getCategoryStats(): Promise<{ category: string; count: number }[]> {
    return await materialRepository.getCountByCategory();
  }
}

export default new MaterialService();
