import materialRepository from '../repositories/material.repository';
import { IMaterial, MaterialResponse, MaterialUploadedByUser } from '../models/material.model';
import { PaginationOptions } from '../types';
import { NotFoundError, BadRequestError, AppError } from '../utils/AppError';
import userRepository from '../repositories/user.repository';

/**
 * Interface for creating a material
 */
export interface CreateMaterialData {
  name: string;
  description?: string;
  fileUrl: string;
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
   * Helper method to populate uploaded by user info
   */
  private async populateUploadedBy(material: IMaterial): Promise<MaterialResponse> {
    const user = await userRepository.findById(material.uploadedBy);

    const uploadedByUser: MaterialUploadedByUser = user
      ? {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim() || 'Unknown User',
          email: user.email,
        }
      : {
          id: material.uploadedBy,
          name: 'Unknown User',
          email: '',
        };

    const { uploadedBy, tags, ...materialData } = material;

    const response: any = {
      ...materialData,
      uploadedBy: uploadedByUser,
      formattedFileSize: this.formatFileSize(material.fileSize),
    };

    // Only add tags if it's a valid non-empty array
    if (tags && Array.isArray(tags) && tags.length > 0) {
      response.tags = tags;
    }

    return response;
  }

  /**
   * Format file size to human readable format
   */
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

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
      description: data.description?.trim(),
      fileUrl: data.fileUrl,
      fileType: data.fileType.toLowerCase(),
      fileSize: data.fileSize,
      category: data.category?.trim(),
      tags: data.tags,
      uploadedBy: data.uploadedBy as any,
    });

    return material;
  }

  /**
   * Get all materials with pagination
   */
  async getAll(options: PaginationOptions, filters: { isActive?: boolean } = {}): Promise<{ items: IMaterial[]; total: number }> {
    return await materialRepository.findAll(options, filters);
  }

  /**
   * Get all materials with pagination and populated user data
   */
  async getAllWithUser(options: PaginationOptions, filters: { isActive?: boolean } = {}): Promise<{ items: MaterialResponse[]; total: number }> {
    const result = await materialRepository.findAll(options, filters);
    const itemsWithUser = await Promise.all(
      result.items.map(material => this.populateUploadedBy(material))
    );
    return { items: itemsWithUser, total: result.total };
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
   * Get material by ID with populated user data
   */
  async getByIdWithUser(id: string): Promise<MaterialResponse> {
    const material = await this.getById(id);
    return await this.populateUploadedBy(material);
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
   * Get statistics by category
   */
  async getCategoryStats(): Promise<{ category: string; count: number }[]> {
    return await materialRepository.getCountByCategory();
  }

  /**
   * Publish material (Admin only)
   */
  async publishMaterial(id: string): Promise<IMaterial> {
    const material = await materialRepository.findById(id);
    if (!material) {
      throw new AppError('Material not found', 404);
    }

    if (material.isPublished) {
      throw new AppError('Material is already published', 400);
    }

    const published = await materialRepository.publish(id);
    if (!published) {
      throw new AppError('Failed to publish material', 500);
    }

    return published;
  }

  /**
   * Unpublish material (Admin only)
   */
  async unpublishMaterial(id: string): Promise<IMaterial> {
    const material = await materialRepository.findById(id);
    if (!material) {
      throw new AppError('Material not found', 404);
    }

    if (!material.isPublished) {
      throw new AppError('Material is not published', 400);
    }

    const unpublished = await materialRepository.unpublish(id);
    if (!unpublished) {
      throw new AppError('Failed to unpublish material', 500);
    }

    return unpublished;
  }
}

export default new MaterialService();
