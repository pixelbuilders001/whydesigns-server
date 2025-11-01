import { IReel } from '../models/reel.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { createBaseFields } from '../models/base.model';

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

export class ReelRepository extends BaseRepository<IReel> {
  constructor() {
    super(TABLES.REELS);
  }

  /**
   * Create a new reel
   */
  async create(reelData: Partial<IReel>): Promise<IReel> {
    const _id = this.generateId();

    const reel: IReel = {
      _id,
      title: reelData.title || '',
      description: reelData.description,
      videoUrl: reelData.videoUrl || '',
      thumbnailUrl: reelData.thumbnailUrl,
      duration: reelData.duration || 0,
      fileSize: reelData.fileSize || 0,
      category: reelData.category,
      tags: reelData.tags || [],
      viewCount: reelData.viewCount || 0,
      likeCount: reelData.likeCount || 0,
      uploadedBy: reelData.uploadedBy || '',
      isPublished: reelData.isPublished || false,
      publishedAt: reelData.publishedAt || null,
      displayOrder: reelData.displayOrder || 0,
      ...createBaseFields(),
    };

    return await this.putItem(reel);
  }

  /**
   * Find reel by ID
   */
  async findById(id: string): Promise<IReel | null> {
    return await this.getItem({ _id: id });
  }

  /**
   * Find all reels with filters and pagination
   */
  async findAll(
    filters: ReelFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ reels: IReel[]; total: number; page: number; totalPages: number }> {
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

    let reels = result.items;

    // Filter by category/tags/search in memory
    if (filters.category) {
      const categoryLower = filters.category.toLowerCase();
      reels = reels.filter(r => r.category?.toLowerCase().includes(categoryLower));
    }

    if (filters.tags) {
      const tagsLower = filters.tags.toLowerCase();
      reels = reels.filter(r => r.tags?.some(t => t.toLowerCase().includes(tagsLower)));
    }

    if (filters.search) {
      const queryLower = filters.search.toLowerCase();
      reels = reels.filter(r =>
        r.title?.toLowerCase().includes(queryLower) ||
        r.description?.toLowerCase().includes(queryLower) ||
        r.category?.toLowerCase().includes(queryLower) ||
        r.tags?.some(t => t.toLowerCase().includes(queryLower))
      );
    }

    // Sort in memory
    const sortedReels = this.sortItems(reels, sortBy, sortOrder);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedReels = sortedReels.slice(skip, skip + limit);

    return {
      reels: paginatedReels,
      total: sortedReels.length,
      page,
      totalPages: Math.ceil(sortedReels.length / limit),
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

    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive AND #isPublished = :isPublished',
      expressionAttributeNames: { '#isActive': 'isActive', '#isPublished': 'isPublished' },
      expressionAttributeValues: { ':isActive': true, ':isPublished': true },
    });

    // Filter by tags in memory
    const filteredReels = result.items.filter(reel =>
      reel.tags && tags.some(tag => reel.tags.includes(tag))
    );

    // Sort
    const sortedReels = this.sortItems(filteredReels, sortBy, sortOrder);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedReels = sortedReels.slice(skip, skip + limit);

    return {
      reels: paginatedReels,
      total: filteredReels.length,
      page,
      totalPages: Math.ceil(filteredReels.length / limit),
    };
  }

  /**
   * Find reels by uploader
   */
  async findByUploader(uploaderId: string): Promise<IReel[]> {
    const result = await this.scanItems({
      filterExpression: '#uploadedBy = :uploadedBy AND #isActive = :isActive',
      expressionAttributeNames: { '#uploadedBy': 'uploadedBy', '#isActive': 'isActive' },
      expressionAttributeValues: { ':uploadedBy': uploaderId, ':isActive': true },
    });

    return this.sortItems(result.items, 'createdAt', 'desc');
  }

  /**
   * Find most viewed reels
   */
  async findMostViewed(limit: number = 10): Promise<IReel[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive AND #isPublished = :isPublished',
      expressionAttributeNames: { '#isActive': 'isActive', '#isPublished': 'isPublished' },
      expressionAttributeValues: { ':isActive': true, ':isPublished': true },
    });

    const sorted = this.sortItems(result.items, 'viewCount', 'desc');
    return sorted.slice(0, limit);
  }

  /**
   * Find most liked reels
   */
  async findMostLiked(limit: number = 10): Promise<IReel[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive AND #isPublished = :isPublished',
      expressionAttributeNames: { '#isActive': 'isActive', '#isPublished': 'isPublished' },
      expressionAttributeValues: { ':isActive': true, ':isPublished': true },
    });

    const sorted = this.sortItems(result.items, 'likeCount', 'desc');
    return sorted.slice(0, limit);
  }

  /**
   * Find recent reels
   */
  async findRecent(limit: number = 10): Promise<IReel[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive AND #isPublished = :isPublished',
      expressionAttributeNames: { '#isActive': 'isActive', '#isPublished': 'isPublished' },
      expressionAttributeValues: { ':isActive': true, ':isPublished': true },
    });

    const sorted = this.sortItems(result.items, 'publishedAt', 'desc');
    return sorted.slice(0, limit);
  }

  /**
   * Update reel
   */
  async update(id: string, updateData: Partial<IReel>): Promise<IReel | null> {
    return await this.updateItem({ _id: id }, updateData);
  }

  /**
   * Delete reel (soft delete)
   */
  async softDelete(id: string): Promise<IReel | null> {
    return await this.softDeleteItem({ _id: id });
  }

  /**
   * Delete reel (hard delete)
   */
  async delete(id: string): Promise<IReel | null> {
    const reel = await this.findById(id);
    await this.hardDeleteItem({ _id: id });
    return reel;
  }

  /**
   * Publish reel
   */
  async publish(id: string): Promise<IReel | null> {
    return await this.update(id, { isPublished: true, publishedAt: new Date().toISOString() });
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
    const reel = await this.findById(id);
    if (reel) {
      return await this.updateItem({ _id: id }, { viewCount: (reel.viewCount || 0) + 1 });
    }
    return null;
  }

  /**
   * Increment like count
   */
  async incrementLikeCount(id: string): Promise<IReel | null> {
    const reel = await this.findById(id);
    if (reel) {
      return await this.updateItem({ _id: id }, { likeCount: (reel.likeCount || 0) + 1 });
    }
    return null;
  }

  /**
   * Decrement like count
   */
  async decrementLikeCount(id: string): Promise<IReel | null> {
    const reel = await this.findById(id);
    if (reel && reel.likeCount > 0) {
      return await this.updateItem({ _id: id }, { likeCount: reel.likeCount - 1 });
    }
    return null;
  }

  /**
   * Get reel statistics
   */
  async getStats(): Promise<any> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    const total = result.items.length;
    const published = result.items.filter(r => r.isPublished).length;
    const unpublished = result.items.filter(r => !r.isPublished).length;
    const totalViews = result.items.reduce((sum, r) => sum + (r.viewCount || 0), 0);
    const totalLikes = result.items.reduce((sum, r) => sum + (r.likeCount || 0), 0);

    // Categories count
    const categoryCount = result.items
      .filter(r => r.isPublished)
      .reduce((acc: Record<string, number>, r) => {
        const category = r.category || 'uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

    const categories = Object.entries(categoryCount)
      .map(([_id, count]) => ({ _id, count }))
      .sort((a, b) => b.count - a.count);

    const publishedReels = result.items.filter(r => r.isPublished);
    const avgViews = publishedReels.length > 0
      ? (publishedReels.reduce((sum, r) => sum + (r.viewCount || 0), 0) / publishedReels.length).toFixed(2)
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
    result.items.forEach(reel => {
      if (reel.category && reel.category.trim() !== '') {
        categoriesSet.add(reel.category);
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
    result.items.forEach(reel => {
      reel.tags?.forEach(tag => {
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
  private sortItems(items: IReel[], sortBy: string, sortOrder: string): IReel[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new ReelRepository();
