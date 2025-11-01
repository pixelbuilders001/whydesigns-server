import { IVideo } from '../models/video.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { createBaseFields } from '../models/base.model';

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

export class VideoRepository extends BaseRepository<IVideo> {
  constructor() {
    super(TABLES.VIDEOS);
  }

  /**
   * Create a new video
   */
  async create(videoData: Partial<IVideo>): Promise<IVideo> {
    const id = this.generateId();

    const video: IVideo = {
      id,
      title: videoData.title || '',
      description: videoData.description,
      videoUrl: videoData.videoUrl || '',
      thumbnailUrl: videoData.thumbnailUrl,
      posterUrl: videoData.posterUrl,
      duration: videoData.duration || 0,
      fileSize: videoData.fileSize || 0,
      category: videoData.category,
      tags: videoData.tags || [],
      viewCount: videoData.viewCount || 0,
      likeCount: videoData.likeCount || 0,
      uploadedBy: videoData.uploadedBy || '',
      isPublished: videoData.isPublished || false,
      publishedAt: videoData.publishedAt || null,
      displayOrder: videoData.displayOrder || 0,
      ...createBaseFields(),
    };

    return await this.putItem(video);
  }

  /**
   * Find video by ID
   */
  async findById(id: string): Promise<IVideo | null> {
    return await this.getItem({ id: id });
  }

  /**
   * Find all videos with filters and pagination
   */
  async findAll(
    filters: VideoFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ videos: IVideo[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    // Build filter expression
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (filters.isActive !== undefined) {
      filterExpressions.push('#isActive = :isActive');
      expressionAttributeNames['#isActive'] = 'isActive';
      expressionAttributeValues[':isActive'] = filters.isActive;
    }

    if (filters.isPublished !== undefined) {
      filterExpressions.push('#isPublished = :isPublished');
      expressionAttributeNames['#isPublished'] = 'isPublished';
      expressionAttributeValues[':isPublished'] = filters.isPublished;
    }

    if (filters.uploadedBy) {
      filterExpressions.push('#uploadedBy = :uploadedBy');
      expressionAttributeNames['#uploadedBy'] = 'uploadedBy';
      expressionAttributeValues[':uploadedBy'] = filters.uploadedBy;
    }

    // Scan with filters
    const result = await this.scanItems({
      filterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      expressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      expressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
    });

    let videos = result.items;

    // Filter by category/tags/search in memory
    if (filters.category) {
      const categoryLower = filters.category.toLowerCase();
      videos = videos.filter(v => v.category?.toLowerCase().includes(categoryLower));
    }

    if (filters.tags) {
      const tagsLower = filters.tags.toLowerCase();
      videos = videos.filter(v => v.tags?.some(t => t.toLowerCase().includes(tagsLower)));
    }

    if (filters.search) {
      const queryLower = filters.search.toLowerCase();
      videos = videos.filter(v =>
        v.title?.toLowerCase().includes(queryLower) ||
        v.description?.toLowerCase().includes(queryLower) ||
        v.category?.toLowerCase().includes(queryLower) ||
        v.tags?.some(t => t.toLowerCase().includes(queryLower))
      );
    }

    // Sort in memory
    const sortedVideos = this.sortItems(videos, sortBy, sortOrder);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedVideos = sortedVideos.slice(skip, skip + limit);

    return {
      videos: paginatedVideos,
      total: sortedVideos.length,
      page,
      totalPages: Math.ceil(sortedVideos.length / limit),
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

    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive AND #isPublished = :isPublished',
      expressionAttributeNames: { '#isActive': 'isActive', '#isPublished': 'isPublished' },
      expressionAttributeValues: { ':isActive': true, ':isPublished': true },
    });

    // Filter by tags in memory
    const filteredVideos = result.items.filter(video =>
      video.tags && tags.some(tag => video.tags.includes(tag))
    );

    // Sort
    const sortedVideos = this.sortItems(filteredVideos, sortBy, sortOrder);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedVideos = sortedVideos.slice(skip, skip + limit);

    return {
      videos: paginatedVideos,
      total: filteredVideos.length,
      page,
      totalPages: Math.ceil(filteredVideos.length / limit),
    };
  }

  /**
   * Find videos by uploader
   */
  async findByUploader(uploaderId: string): Promise<IVideo[]> {
    const result = await this.scanItems({
      filterExpression: '#uploadedBy = :uploadedBy AND #isActive = :isActive',
      expressionAttributeNames: { '#uploadedBy': 'uploadedBy', '#isActive': 'isActive' },
      expressionAttributeValues: { ':uploadedBy': uploaderId, ':isActive': true },
    });

    return this.sortItems(result.items, 'createdAt', 'desc');
  }

  /**
   * Find most viewed videos
   */
  async findMostViewed(limit: number = 10): Promise<IVideo[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive AND #isPublished = :isPublished',
      expressionAttributeNames: { '#isActive': 'isActive', '#isPublished': 'isPublished' },
      expressionAttributeValues: { ':isActive': true, ':isPublished': true },
    });

    const sorted = this.sortItems(result.items, 'viewCount', 'desc');
    return sorted.slice(0, limit);
  }

  /**
   * Find most liked videos
   */
  async findMostLiked(limit: number = 10): Promise<IVideo[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive AND #isPublished = :isPublished',
      expressionAttributeNames: { '#isActive': 'isActive', '#isPublished': 'isPublished' },
      expressionAttributeValues: { ':isActive': true, ':isPublished': true },
    });

    const sorted = this.sortItems(result.items, 'likeCount', 'desc');
    return sorted.slice(0, limit);
  }

  /**
   * Find recent videos
   */
  async findRecent(limit: number = 10): Promise<IVideo[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive AND #isPublished = :isPublished',
      expressionAttributeNames: { '#isActive': 'isActive', '#isPublished': 'isPublished' },
      expressionAttributeValues: { ':isActive': true, ':isPublished': true },
    });

    const sorted = this.sortItems(result.items, 'publishedAt', 'desc');
    return sorted.slice(0, limit);
  }

  /**
   * Update video
   */
  async update(id: string, updateData: Partial<IVideo>): Promise<IVideo | null> {
    return await this.updateItem({ id: id }, updateData);
  }

  /**
   * Delete video (soft delete)
   */
  async softDelete(id: string): Promise<IVideo | null> {
    return await this.softDeleteItem({ id: id });
  }

  /**
   * Delete video (hard delete)
   */
  async delete(id: string): Promise<IVideo | null> {
    const video = await this.findById(id);
    await this.hardDeleteItem({ id: id });
    return video;
  }

  /**
   * Publish video
   */
  async publish(id: string): Promise<IVideo | null> {
    return await this.update(id, { isPublished: true, publishedAt: new Date().toISOString() });
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
    const video = await this.findById(id);
    if (video) {
      return await this.updateItem({ id: id }, { viewCount: (video.viewCount || 0) + 1 });
    }
    return null;
  }

  /**
   * Increment like count
   */
  async incrementLikeCount(id: string): Promise<IVideo | null> {
    const video = await this.findById(id);
    if (video) {
      return await this.updateItem({ id: id }, { likeCount: (video.likeCount || 0) + 1 });
    }
    return null;
  }

  /**
   * Decrement like count
   */
  async decrementLikeCount(id: string): Promise<IVideo | null> {
    const video = await this.findById(id);
    if (video && video.likeCount > 0) {
      return await this.updateItem({ id: id }, { likeCount: video.likeCount - 1 });
    }
    return null;
  }

  /**
   * Get video statistics
   */
  async getStats(): Promise<any> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    const total = result.items.length;
    const published = result.items.filter(v => v.isPublished).length;
    const unpublished = result.items.filter(v => !v.isPublished).length;
    const totalViews = result.items.reduce((sum, v) => sum + (v.viewCount || 0), 0);
    const totalLikes = result.items.reduce((sum, v) => sum + (v.likeCount || 0), 0);

    // Categories count
    const categoryCount = result.items
      .filter(v => v.isPublished)
      .reduce((acc: Record<string, number>, v) => {
        const category = v.category || 'uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

    const categories = Object.entries(categoryCount)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count);

    const publishedVideos = result.items.filter(v => v.isPublished);
    const avgViews = publishedVideos.length > 0
      ? (publishedVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0) / publishedVideos.length).toFixed(2)
      : 0;

    return {
      total,
      published,
      unpublished,
      totalViews,
      totalLikes,
      averageViews: avgViews,
      categories,
    };
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive AND #isPublished = :isPublished',
      expressionAttributeNames: { '#isActive': 'isActive', '#isPublished': 'isPublished' },
      expressionAttributeValues: { ':isActive': true, ':isPublished': true },
    });

    const categoriesSet = new Set<string>();
    result.items.forEach(video => {
      if (video.category && video.category.trim() !== '') {
        categoriesSet.add(video.category);
      }
    });

    return Array.from(categoriesSet).sort();
  }

  /**
   * Get all unique tags
   */
  async getTags(): Promise<string[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive AND #isPublished = :isPublished',
      expressionAttributeNames: { '#isActive': 'isActive', '#isPublished': 'isPublished' },
      expressionAttributeValues: { ':isActive': true, ':isPublished': true },
    });

    const tagsSet = new Set<string>();
    result.items.forEach(video => {
      video.tags?.forEach(tag => {
        if (tag && tag.trim() !== '') {
          tagsSet.add(tag);
        }
      });
    });

    return Array.from(tagsSet).sort();
  }

  /**
   * Helper method to sort items in memory
   */
  private sortItems(items: IVideo[], sortBy: string, sortOrder: string): IVideo[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new VideoRepository();
