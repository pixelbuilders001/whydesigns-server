import { IBanner } from '../models/banner.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { createBaseFields } from '../models/base.model';

export interface BannerFilters {
  isPublished?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class BannerRepository extends BaseRepository<IBanner> {
  constructor() {
    super(TABLES.BANNERS);
  }

  /**
   * Create a new banner group
   */
  async create(bannerData: Partial<IBanner>): Promise<IBanner> {
    const _id = this.generateId();

    const banner: IBanner = {
      _id,
      title: bannerData.title || '',
      description: bannerData.description,
      imageUrl: bannerData.imageUrl || '',
      linkUrl: bannerData.linkUrl,
      isPublished: bannerData.isPublished || false,
      publishedAt: bannerData.publishedAt || null,
      displayOrder: bannerData.displayOrder || 0,
      ...createBaseFields(),
    };

    return await this.putItem(banner);
  }

  /**
   * Find all banner groups with filters
   */
  async findAll(
    filters: BannerFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ banners: IBanner[]; total: number; page: number; totalPages: number }> {
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

    // Scan with filters
    const result = await this.scanItems({
      filterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      expressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      expressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
    });

    let banners = result.items;

    // Apply search filter in memory
    if (filters.search) {
      const queryLower = filters.search.toLowerCase();
      banners = banners.filter(banner =>
        banner.title?.toLowerCase().includes(queryLower) ||
        banner.description?.toLowerCase().includes(queryLower)
      );
    }

    // Sort in memory
    const sortedBanners = this.sortItems(banners, sortBy, sortOrder);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedBanners = sortedBanners.slice(skip, skip + limit);

    return {
      banners: paginatedBanners,
      total: sortedBanners.length,
      page,
      totalPages: Math.ceil(sortedBanners.length / limit),
    };
  }

  /**
   * Find published banner group (only one should be published at a time)
   */
  async findPublished(): Promise<IBanner | null> {
    const result = await this.scanItems({
      filterExpression: '#isPublished = :isPublished AND #isActive = :isActive',
      expressionAttributeNames: { '#isPublished': 'isPublished', '#isActive': 'isActive' },
      expressionAttributeValues: { ':isPublished': true, ':isActive': true },
    });

    return result.items[0] || null;
  }

  /**
   * Find banner group by ID
   */
  async findById(id: string): Promise<IBanner | null> {
    return await this.getItem({ _id: id });
  }

  /**
   * Update banner group
   */
  async update(id: string, updateData: Partial<IBanner>): Promise<IBanner | null> {
    return await this.updateItem({ _id: id }, updateData);
  }

  /**
   * Delete banner group
   */
  async delete(id: string): Promise<IBanner | null> {
    const banner = await this.findById(id);
    await this.hardDeleteItem({ _id: id });
    return banner;
  }

  /**
   * Deactivate banner group (soft delete)
   */
  async deactivate(id: string): Promise<IBanner | null> {
    return await this.softDeleteItem({ _id: id });
  }

  /**
   * Unpublish all banner groups
   */
  async unpublishAll(): Promise<void> {
    const result = await this.scanItems({
      filterExpression: '#isPublished = :isPublished',
      expressionAttributeNames: { '#isPublished': 'isPublished' },
      expressionAttributeValues: { ':isPublished': true },
    });

    // Update each published banner to unpublish it
    for (const banner of result.items) {
      await this.updateItem({ _id: banner._id }, { isPublished: false });
    }
  }

  /**
   * Publish a banner group (and unpublish all others)
   */
  async publish(id: string): Promise<IBanner | null> {
    // First, unpublish all other banner groups
    await this.unpublishAll();

    // Then publish the specified banner group
    return await this.updateItem(
      { _id: id },
      {
        isPublished: true,
        publishedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Unpublish a specific banner group
   */
  async unpublish(id: string): Promise<IBanner | null> {
    return await this.updateItem(
      { _id: id },
      { isPublished: false }
    );
  }

  /**
   * Get banner statistics
   */
  async getStats(): Promise<any> {
    const result = await this.scanItems({});

    const total = result.items.length;
    const published = result.items.filter(b => b.isPublished).length;
    const unpublished = result.items.filter(b => !b.isPublished).length;
    const active = result.items.filter(b => b.isActive).length;
    const inactive = result.items.filter(b => !b.isActive).length;

    return {
      total,
      published,
      unpublished,
      active,
      inactive,
    };
  }

  /**
   * Helper method to sort items in memory
   */
  private sortItems(items: IBanner[], sortBy: string, sortOrder: string): IBanner[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new BannerRepository();
