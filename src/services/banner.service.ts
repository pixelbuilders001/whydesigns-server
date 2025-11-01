import bannerRepository, { BannerFilters, PaginationOptions } from '../repositories/banner.repository';
import { IBanner } from '../models/banner.model';
import { AppError } from '../utils/AppError';
import s3Service from './s3.service';

class BannerService {
  /**
   * Create a new banner group
   */
  async createBanner(createdBy: string, bannerData: Partial<IBanner>): Promise<IBanner> {
    const banner = await bannerRepository.create({
      ...bannerData,
    });

    return banner;
  }

  /**
   * Get all banner groups with filters
   */
  async getAllBanners(
    filters: BannerFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ banners: IBanner[]; total: number; page: number; totalPages: number }> {
    return await bannerRepository.findAll(filters, options);
  }

  /**
   * Get published banner group (public view)
   */
  async getPublishedBanner(): Promise<IBanner | null> {
    const banner = await bannerRepository.findPublished();
    return banner;
  }

  /**
   * Get banner group by ID
   */
  async getBannerById(id: string): Promise<IBanner> {
    const banner = await bannerRepository.findById(id);
    if (!banner) {
      throw new AppError('Banner group not found', 404);
    }
    return banner;
  }

  /**
   * Update banner group
   */
  async updateBanner(id: string, updateData: Partial<IBanner>): Promise<IBanner> {
    const banner = await bannerRepository.findById(id);
    if (!banner) {
      throw new AppError('Banner group not found', 404);
    }

    const updatedBanner = await bannerRepository.update(id, updateData);
    if (!updatedBanner) {
      throw new AppError('Failed to update banner group', 500);
    }

    return updatedBanner;
  }

  /**
   * Delete banner (and associated image from S3)
   */
  async deleteBanner(id: string): Promise<void> {
    const banner = await bannerRepository.findById(id);
    if (!banner) {
      throw new AppError('Banner not found', 404);
    }

    // Delete banner image from S3
    if (banner.imageUrl) {
      await s3Service.deleteFile(banner.imageUrl);
    }

    await bannerRepository.delete(id);
  }

  /**
   * Deactivate banner group (soft delete)
   */
  async deactivateBanner(id: string): Promise<IBanner> {
    const banner = await bannerRepository.findById(id);
    if (!banner) {
      throw new AppError('Banner group not found', 404);
    }

    const deactivatedBanner = await bannerRepository.deactivate(id);
    if (!deactivatedBanner) {
      throw new AppError('Failed to deactivate banner group', 500);
    }

    return deactivatedBanner;
  }

  /**
   * Publish a banner group (unpublishes all others automatically)
   */
  async publishBanner(id: string): Promise<IBanner> {
    const banner = await bannerRepository.findById(id);
    if (!banner) {
      throw new AppError('Banner group not found', 404);
    }

    if (!banner.isActive) {
      throw new AppError('Cannot publish an inactive banner group', 400);
    }

    const publishedBanner = await bannerRepository.publish(id);
    if (!publishedBanner) {
      throw new AppError('Failed to publish banner group', 500);
    }

    return publishedBanner;
  }

  /**
   * Unpublish a banner group
   */
  async unpublishBanner(id: string): Promise<IBanner> {
    const banner = await bannerRepository.findById(id);
    if (!banner) {
      throw new AppError('Banner group not found', 404);
    }

    const unpublishedBanner = await bannerRepository.unpublish(id);
    if (!unpublishedBanner) {
      throw new AppError('Failed to unpublish banner group', 500);
    }

    return unpublishedBanner;
  }

  /**
   * Get banner statistics
   */
  async getBannerStats(): Promise<any> {
    return await bannerRepository.getStats();
  }
}

export default new BannerService();
