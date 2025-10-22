import Reel, { IReel } from '../models/reel.model';
import mongoose from 'mongoose';

export interface ReelFilters {
  isActive?: boolean;
  isPublished?: boolean;
  category?: string;
  tags?: string;
  uploadedBy?: string;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class ReelRepository {
  /**
   * Create a new reel
   */
  async create(reelData: Partial<IReel>): Promise<IReel> {
    const reel = await Reel.create(reelData);
    return reel;
  }

  /**
   * Find reel by ID
   */
  async findById(id: string): Promise<IReel | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Reel.findById(id);
  }

  /**
   * Find all reels with filters and pagination
   */
  async findAll(
    filters: ReelFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ reels: IReel[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.isPublished !== undefined) {
      query.isPublished = filters.isPublished;
    }

    if (filters.category) {
      query.category = new RegExp(filters.category, 'i');
    }

    if (filters.tags) {
      query.tags = { $in: [new RegExp(filters.tags, 'i')] };
    }

    if (filters.uploadedBy) {
      query.uploadedBy = filters.uploadedBy;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Execute query
    const [reels, total] = await Promise.all([
      Reel.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Reel.countDocuments(query),
    ]);

    return {
      reels,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find published reels (public)
   */
  async findPublished(
    options: PaginationOptions = {}
  ): Promise<{ reels: IReel[]; total: number; page: number; totalPages: number }> {
    return this.findAll(
      { isActive: true, isPublished: true },
      { ...options, sortBy: options.sortBy || 'publishedAt' }
    );
  }

  /**
   * Find reels by category
   */
  async findByCategory(
    category: string,
    options: PaginationOptions = {}
  ): Promise<{ reels: IReel[]; total: number; page: number; totalPages: number }> {
    return this.findAll(
      { isActive: true, isPublished: true, category },
      options
    );
  }

  /**
   * Find reels by tags
   */
  async findByTags(
    tags: string[],
    options: PaginationOptions = {}
  ): Promise<{ reels: IReel[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const query = {
      isActive: true,
      isPublished: true,
      tags: { $in: tags },
    };

    const [reels, total] = await Promise.all([
      Reel.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Reel.countDocuments(query),
    ]);

    return {
      reels,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find reels by uploader
   */
  async findByUploader(uploaderId: string): Promise<IReel[]> {
    if (!mongoose.Types.ObjectId.isValid(uploaderId)) {
      return [];
    }
    return await Reel.find({ uploadedBy: uploaderId, isActive: true }).sort({ createdAt: -1 });
  }

  /**
   * Find most viewed reels
   */
  async findMostViewed(
    limit: number = 10
  ): Promise<IReel[]> {
    return await Reel.find({ isActive: true, isPublished: true })
      .sort({ viewCount: -1 })
      .limit(limit);
  }

  /**
   * Find most liked reels
   */
  async findMostLiked(
    limit: number = 10
  ): Promise<IReel[]> {
    return await Reel.find({ isActive: true, isPublished: true })
      .sort({ likeCount: -1 })
      .limit(limit);
  }

  /**
   * Find recent reels
   */
  async findRecent(
    limit: number = 10
  ): Promise<IReel[]> {
    return await Reel.find({ isActive: true, isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(limit);
  }

  /**
   * Update reel
   */
  async update(id: string, updateData: Partial<IReel>): Promise<IReel | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Reel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete reel (soft delete)
   */
  async softDelete(id: string): Promise<IReel | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Reel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Delete reel (hard delete)
   */
  async delete(id: string): Promise<IReel | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Reel.findByIdAndDelete(id);
  }

  /**
   * Publish reel
   */
  async publish(id: string): Promise<IReel | null> {
    return await this.update(id, { isPublished: true, publishedAt: new Date() });
  }

  /**
   * Unpublish reel
   */
  async unpublish(id: string): Promise<IReel | null> {
    return await this.update(id, { isPublished: false });
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<IReel | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Reel.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  }

  /**
   * Increment like count
   */
  async incrementLikeCount(id: string): Promise<IReel | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Reel.findByIdAndUpdate(
      id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );
  }

  /**
   * Decrement like count
   */
  async decrementLikeCount(id: string): Promise<IReel | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Reel.findByIdAndUpdate(
      id,
      { $inc: { likeCount: -1 } },
      { new: true }
    );
  }

  /**
   * Get reel statistics
   */
  async getStats(): Promise<any> {
    const [total, published, unpublished, totalViews, totalLikes, categories] = await Promise.all([
      Reel.countDocuments({ isActive: true }),
      Reel.countDocuments({ isActive: true, isPublished: true }),
      Reel.countDocuments({ isActive: true, isPublished: false }),
      Reel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$viewCount' } } },
      ]),
      Reel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$likeCount' } } },
      ]),
      Reel.aggregate([
        { $match: { isActive: true, isPublished: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const avgViews = await Reel.aggregate([
      { $match: { isActive: true, isPublished: true } },
      { $group: { _id: null, average: { $avg: '$viewCount' } } },
    ]);

    return {
      total,
      published,
      unpublished,
      totalViews: totalViews.length > 0 ? totalViews[0].total : 0,
      totalLikes: totalLikes.length > 0 ? totalLikes[0].total : 0,
      averageViews: avgViews.length > 0 ? avgViews[0].average.toFixed(2) : 0,
      categories,
    };
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    const categories = await Reel.distinct('category', { isActive: true, isPublished: true });
    return categories.filter(cat => cat && cat.trim() !== '');
  }

  /**
   * Get all unique tags
   */
  async getTags(): Promise<string[]> {
    const tags = await Reel.distinct('tags', { isActive: true, isPublished: true });
    return tags.filter(tag => tag && tag.trim() !== '');
  }
}

export default new ReelRepository();
