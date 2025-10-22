import { Material, IMaterial } from '../models/material.model';
import { PaginationOptions } from '../types';

/**
 * Material Repository
 * Handles all database operations for materials
 */
export class MaterialRepository {
  /**
   * Create a new material
   */
  async create(data: Partial<IMaterial>): Promise<IMaterial> {
    const material = await Material.create(data);
    return material;
  }

  /**
   * Find material by ID
   */
  async findById(id: string): Promise<IMaterial | null> {
    return await Material.findOne({ _id: id, isActive: true }).populate('uploadedBy', 'name email');
  }

  /**
   * Find all materials with pagination
   */
  async findAll(options: PaginationOptions): Promise<{ items: IMaterial[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const filter = { isActive: true };

    const [items, total] = await Promise.all([
      Material.find(filter)
        .populate('uploadedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Material.countDocuments(filter),
    ]);

    return { items, total };
  }

  /**
   * Find materials by category
   */
  async findByCategory(
    category: string,
    options: PaginationOptions
  ): Promise<{ items: IMaterial[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const filter = { category, isActive: true };

    const [items, total] = await Promise.all([
      Material.find(filter)
        .populate('uploadedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Material.countDocuments(filter),
    ]);

    return { items, total };
  }

  /**
   * Find materials by tags
   */
  async findByTags(
    tags: string[],
    options: PaginationOptions
  ): Promise<{ items: IMaterial[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const filter = { tags: { $in: tags }, isActive: true };

    const [items, total] = await Promise.all([
      Material.find(filter)
        .populate('uploadedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Material.countDocuments(filter),
    ]);

    return { items, total };
  }

  /**
   * Search materials by query
   */
  async search(
    query: string,
    options: PaginationOptions
  ): Promise<{ items: IMaterial[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const filter = {
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ],
    };

    const [items, total] = await Promise.all([
      Material.find(filter)
        .populate('uploadedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Material.countDocuments(filter),
    ]);

    return { items, total };
  }

  /**
   * Update material by ID
   */
  async update(id: string, data: Partial<IMaterial>): Promise<IMaterial | null> {
    return await Material.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate('uploadedBy', 'name email');
  }

  /**
   * Delete material by ID (soft delete)
   */
  async delete(id: string): Promise<IMaterial | null> {
    return await Material.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).populate('uploadedBy', 'name email');
  }

  /**
   * Hard delete material by ID
   */
  async hardDelete(id: string): Promise<IMaterial | null> {
    return await Material.findByIdAndDelete(id);
  }

  /**
   * Soft delete material by ID
   */
  async softDelete(id: string): Promise<IMaterial | null> {
    return await Material.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).populate('uploadedBy', 'name email');
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(id: string): Promise<IMaterial | null> {
    return await Material.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    ).populate('uploadedBy', 'name email');
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    const categories = await Material.distinct('category', { isActive: true });
    return categories.filter(Boolean);
  }

  /**
   * Get all unique tags
   */
  async getTags(): Promise<string[]> {
    const materials = await Material.find({ isActive: true }).select('tags');
    const allTags = materials.flatMap((material) => material.tags);
    return [...new Set(allTags)].filter(Boolean);
  }

  /**
   * Get material count by category
   */
  async getCountByCategory(): Promise<{ category: string; count: number }[]> {
    return await Material.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }
}

export default new MaterialRepository();
