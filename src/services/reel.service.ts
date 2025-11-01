import reelRepository, { ReelFilters, PaginationOptions } from '../repositories/reel.repository';
import { IReel } from '../models/reel.model';
import { AppError } from '../utils/AppError';

class ReelService {
  /**
   * Create a new reel (Admin only)
   */
  async createReel(uploaderId: string, reelData: Partial<IReel>): Promise<IReel> {
    const reel = await reelRepository.create({
      ...reelData,
      uploadedBy: uploaderId as any,
    });

    return reel;
  }

  /**
   * Get all reels with filters (Admin)
   */
  async getAllReels(
    filters: ReelFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ reels: IReel[]; total: number; page: number; totalPages: number }> {
    return await reelRepository.findAll(filters, options);
  }

  /**
   * Get published reels (Public)
   */
  async getPublishedReels(
    options: PaginationOptions = {}
  ): Promise<{ reels: IReel[]; total: number; page: number; totalPages: number }> {
    return await reelRepository.findPublished(options);
  }

  /**
   * Get reel by ID
   */
  async getReelById(id: string): Promise<IReel> {
    const reel = await reelRepository.findById(id);
    if (!reel) {
      throw new AppError('Reel not found', 404);
    }
    return reel;
  }

  /**
   * Get reels by category
   */
  async getReelsByCategory(
    category: string,
    options: PaginationOptions = {}
  ): Promise<{ reels: IReel[]; total: number; page: number; totalPages: number }> {
    return await reelRepository.findByCategory(category, options);
  }

  /**
   * Get reels by tags
   */
  async getReelsByTags(
    tags: string[],
    options: PaginationOptions = {}
  ): Promise<{ reels: IReel[]; total: number; page: number; totalPages: number }> {
    return await reelRepository.findByTags(tags, options);
  }

  /**
   * Get reels by uploader
   */
  async getReelsByUploader(uploaderId: string): Promise<IReel[]> {
    return await reelRepository.findByUploader(uploaderId);
  }

  /**
   * Get most viewed reels
   */
  async getMostViewedReels(limit: number = 10): Promise<IReel[]> {
    return await reelRepository.findMostViewed(limit);
  }

  /**
   * Get most liked reels
   */
  async getMostLikedReels(limit: number = 10): Promise<IReel[]> {
    return await reelRepository.findMostLiked(limit);
  }

  /**
   * Get recent reels
   */
  async getRecentReels(limit: number = 10): Promise<IReel[]> {
    return await reelRepository.findRecent(limit);
  }

  /**
   * Update reel (Admin only)
   */
  async updateReel(id: string, updateData: Partial<IReel>): Promise<IReel> {
    // Verify reel exists
    await this.getReelById(id);

    const updatedReel = await reelRepository.update(id, updateData);
    if (!updatedReel) {
      throw new AppError('Failed to update reel', 500);
    }

    return updatedReel;
  }

  /**
   * Delete reel (Admin only) - Hard delete
   */
  async deleteReel(id: string): Promise<void> {
    await this.getReelById(id);

    const deleted = await reelRepository.delete(id);
    if (!deleted) {
      throw new AppError('Failed to delete reel', 500);
    }
  }

  /**
   * Soft delete reel (Admin only)
   */
  async deactivateReel(id: string): Promise<IReel> {
    await this.getReelById(id);

    const deactivated = await reelRepository.softDelete(id);
    if (!deactivated) {
      throw new AppError('Failed to deactivate reel', 500);
    }

    return deactivated;
  }

  /**
   * Publish reel (Admin only)
   */
  async publishReel(id: string): Promise<IReel> {
    const reel = await reelRepository.publish(id);
    if (!reel) {
      throw new AppError('Reel not found', 404);
    }
    return reel;
  }

  /**
   * Unpublish reel (Admin only)
   */
  async unpublishReel(id: string): Promise<IReel> {
    const reel = await reelRepository.unpublish(id);
    if (!reel) {
      throw new AppError('Reel not found', 404);
    }
    return reel;
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<IReel> {
    const reel = await reelRepository.incrementViewCount(id);
    if (!reel) {
      throw new AppError('Reel not found', 404);
    }
    return reel;
  }

  /**
   * Like reel
   */
  async likeReel(id: string): Promise<IReel> {
    const reel = await reelRepository.incrementLikeCount(id);
    if (!reel) {
      throw new AppError('Reel not found', 404);
    }
    return reel;
  }

  /**
   * Unlike reel
   */
  async unlikeReel(id: string): Promise<IReel> {
    const reel = await reelRepository.decrementLikeCount(id);
    if (!reel) {
      throw new AppError('Reel not found', 404);
    }
    return reel;
  }

  /**
   * Get reel statistics (Admin only)
   */
  async getReelStats(): Promise<any> {
    return await reelRepository.getStats();
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    return await reelRepository.getCategories();
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<string[]> {
    return await reelRepository.getTags();
  }

  /**
   * Search reels
   */
  async searchReels(
    searchTerm: string,
    options: PaginationOptions = {}
  ): Promise<{ reels: IReel[]; total: number; page: number; totalPages: number }> {
    return await reelRepository.findAll(
      { search: searchTerm, isActive: true, isPublished: true },
      options
    );
  }
}

export default new ReelService();
