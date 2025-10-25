import Banner, { IBanner } from '../models/banner.model';

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

class BannerRepository {
  /**
   * Create a new banner group
   */
  async create(bannerData: Partial<IBanner>): Promise<IBanner> {
    const banner = await Banner.create(bannerData);
    return banner;
  }

  /**
   * Find all banner groups with filters
   */
  async findAll(
    filters: BannerFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ banners: IBanner[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const query: any = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.isPublished !== undefined) {
      query.isPublished = filters.isPublished;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [banners, total] = await Promise.all([
      Banner.find(query).sort(sort).skip(skip).limit(limit).exec(),
      Banner.countDocuments(query),
    ]);

    return {
      banners,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find published banner group (only one should be published at a time)
   */
  async findPublished(): Promise<IBanner | null> {
    return await Banner.findOne({ isPublished: true, isActive: true }).exec();
  }

  /**
   * Find banner group by ID
   */
  async findById(id: string): Promise<IBanner | null> {
    return await Banner.findById(id).exec();
  }

  /**
   * Update banner group
   */
  async update(id: string, updateData: Partial<IBanner>): Promise<IBanner | null> {
    return await Banner.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  /**
   * Delete banner group
   */
  async delete(id: string): Promise<IBanner | null> {
    return await Banner.findByIdAndDelete(id).exec();
  }

  /**
   * Deactivate banner group (soft delete)
   */
  async deactivate(id: string): Promise<IBanner | null> {
    return await Banner.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();
  }

  /**
   * Unpublish all banner groups
   */
  async unpublishAll(): Promise<void> {
    await Banner.updateMany(
      { isPublished: true },
      { isPublished: false }
    ).exec();
  }

  /**
   * Publish a banner group (and unpublish all others)
   */
  async publish(id: string): Promise<IBanner | null> {
    // First, unpublish all other banner groups
    await this.unpublishAll();

    // Then publish the specified banner group
    return await Banner.findByIdAndUpdate(
      id,
      {
        isPublished: true,
        publishedAt: new Date(),
      },
      { new: true }
    ).exec();
  }

  /**
   * Unpublish a specific banner group
   */
  async unpublish(id: string): Promise<IBanner | null> {
    return await Banner.findByIdAndUpdate(
      id,
      { isPublished: false },
      { new: true }
    ).exec();
  }

  /**
   * Get banner statistics
   */
  async getStats(): Promise<any> {
    const [total, published, unpublished, active, inactive] = await Promise.all([
      Banner.countDocuments(),
      Banner.countDocuments({ isPublished: true }),
      Banner.countDocuments({ isPublished: false }),
      Banner.countDocuments({ isActive: true }),
      Banner.countDocuments({ isActive: false }),
    ]);

    return {
      total,
      published,
      unpublished,
      active,
      inactive,
    };
  }
}

export default new BannerRepository();
