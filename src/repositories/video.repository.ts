import Video, { IVideo } from '../models/video.model';
import mongoose from 'mongoose';

export interface VideoFilters {
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

class VideoRepository {
  /**
   * Create a new video
   */
  async create(videoData: Partial<IVideo>): Promise<IVideo> {
    const video = await Video.create(videoData);
    return video;
  }

  /**
   * Find video by ID
   */
  async findById(id: string): Promise<IVideo | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Video.findById(id);
  }

  /**
   * Find all videos with filters and pagination
   */
  async findAll(
    filters: VideoFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ videos: IVideo[]; total: number; page: number; totalPages: number }> {
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
    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Video.countDocuments(query),
    ]);

    return {
      videos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find published videos (public)
   */
  async findPublished(
    options: PaginationOptions = {}
  ): Promise<{ videos: IVideo[]; total: number; page: number; totalPages: number }> {
    return this.findAll(
      { isActive: true, isPublished: true },
      { ...options, sortBy: options.sortBy || 'publishedAt' }
    );
  }

  /**
   * Find videos by category
   */
  async findByCategory(
    category: string,
    options: PaginationOptions = {}
  ): Promise<{ videos: IVideo[]; total: number; page: number; totalPages: number }> {
    return this.findAll(
      { isActive: true, isPublished: true, category },
      options
    );
  }

  /**
   * Find videos by tags
   */
  async findByTags(
    tags: string[],
    options: PaginationOptions = {}
  ): Promise<{ videos: IVideo[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const query = {
      isActive: true,
      isPublished: true,
      tags: { $in: tags },
    };

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Video.countDocuments(query),
    ]);

    return {
      videos,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find videos by uploader
   */
  async findByUploader(uploaderId: string): Promise<IVideo[]> {
    if (!mongoose.Types.ObjectId.isValid(uploaderId)) {
      return [];
    }
    return await Video.find({ uploadedBy: uploaderId, isActive: true }).sort({ createdAt: -1 });
  }

  /**
   * Find most viewed videos
   */
  async findMostViewed(
    limit: number = 10
  ): Promise<IVideo[]> {
    return await Video.find({ isActive: true, isPublished: true })
      .sort({ viewCount: -1 })
      .limit(limit);
  }

  /**
   * Find most liked videos
   */
  async findMostLiked(
    limit: number = 10
  ): Promise<IVideo[]> {
    return await Video.find({ isActive: true, isPublished: true })
      .sort({ likeCount: -1 })
      .limit(limit);
  }

  /**
   * Find recent videos
   */
  async findRecent(
    limit: number = 10
  ): Promise<IVideo[]> {
    return await Video.find({ isActive: true, isPublished: true })
      .sort({ publishedAt: -1 })
      .limit(limit);
  }

  /**
   * Update video
   */
  async update(id: string, updateData: Partial<IVideo>): Promise<IVideo | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Video.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete video (soft delete)
   */
  async softDelete(id: string): Promise<IVideo | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Video.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Delete video (hard delete)
   */
  async delete(id: string): Promise<IVideo | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Video.findByIdAndDelete(id);
  }

  /**
   * Publish video
   */
  async publish(id: string): Promise<IVideo | null> {
    return await this.update(id, { isPublished: true, publishedAt: new Date() });
  }

  /**
   * Unpublish video
   */
  async unpublish(id: string): Promise<IVideo | null> {
    return await this.update(id, { isPublished: false });
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<IVideo | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Video.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  }

  /**
   * Increment like count
   */
  async incrementLikeCount(id: string): Promise<IVideo | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Video.findByIdAndUpdate(
      id,
      { $inc: { likeCount: 1 } },
      { new: true }
    );
  }

  /**
   * Decrement like count
   */
  async decrementLikeCount(id: string): Promise<IVideo | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Video.findByIdAndUpdate(
      id,
      { $inc: { likeCount: -1 } },
      { new: true }
    );
  }

  /**
   * Get video statistics
   */
  async getStats(): Promise<any> {
    const [total, published, unpublished, totalViews, totalLikes, categories] = await Promise.all([
      Video.countDocuments({ isActive: true }),
      Video.countDocuments({ isActive: true, isPublished: true }),
      Video.countDocuments({ isActive: true, isPublished: false }),
      Video.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$viewCount' } } },
      ]),
      Video.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$likeCount' } } },
      ]),
      Video.aggregate([
        { $match: { isActive: true, isPublished: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const avgViews = await Video.aggregate([
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
    const categories = await Video.distinct('category', { isActive: true, isPublished: true });
    return categories.filter(cat => cat && cat.trim() !== '');
  }

  /**
   * Get all unique tags
   */
  async getTags(): Promise<string[]> {
    const tags = await Video.distinct('tags', { isActive: true, isPublished: true });
    return tags.filter(tag => tag && tag.trim() !== '');
  }
}

export default new VideoRepository();
