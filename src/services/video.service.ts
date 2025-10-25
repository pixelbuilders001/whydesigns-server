import videoRepository, { VideoFilters, PaginationOptions } from '../repositories/video.repository';
import { IVideo } from '../models/video.model';
import { AppError } from '../utils/AppError';

class VideoService {
  /**
   * Create a new video (Admin only)
   */
  async createVideo(uploaderId: string, videoData: Partial<IVideo>): Promise<IVideo> {
    const video = await videoRepository.create({
      ...videoData,
      uploadedBy: uploaderId as any,
    });

    return video;
  }

  /**
   * Get all videos with filters (Admin)
   */
  async getAllVideos(
    filters: VideoFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ videos: IVideo[]; total: number; page: number; totalPages: number }> {
    return await videoRepository.findAll(filters, options);
  }

  /**
   * Get published videos (Public)
   */
  async getPublishedVideos(
    options: PaginationOptions = {}
  ): Promise<{ videos: IVideo[]; total: number; page: number; totalPages: number }> {
    return await videoRepository.findPublished(options);
  }

  /**
   * Get video by ID
   */
  async getVideoById(id: string): Promise<IVideo> {
    const video = await videoRepository.findById(id);
    if (!video) {
      throw new AppError('Video not found', 404);
    }
    return video;
  }

  /**
   * Get videos by category
   */
  async getVideosByCategory(
    category: string,
    options: PaginationOptions = {}
  ): Promise<{ videos: IVideo[]; total: number; page: number; totalPages: number }> {
    return await videoRepository.findByCategory(category, options);
  }

  /**
   * Get videos by tags
   */
  async getVideosByTags(
    tags: string[],
    options: PaginationOptions = {}
  ): Promise<{ videos: IVideo[]; total: number; page: number; totalPages: number }> {
    return await videoRepository.findByTags(tags, options);
  }

  /**
   * Get videos by uploader
   */
  async getVideosByUploader(uploaderId: string): Promise<IVideo[]> {
    return await videoRepository.findByUploader(uploaderId);
  }

  /**
   * Get most viewed videos
   */
  async getMostViewedVideos(limit: number = 10): Promise<IVideo[]> {
    return await videoRepository.findMostViewed(limit);
  }

  /**
   * Get most liked videos
   */
  async getMostLikedVideos(limit: number = 10): Promise<IVideo[]> {
    return await videoRepository.findMostLiked(limit);
  }

  /**
   * Get recent videos
   */
  async getRecentVideos(limit: number = 10): Promise<IVideo[]> {
    return await videoRepository.findRecent(limit);
  }

  /**
   * Update video (Admin only)
   */
  async updateVideo(id: string, updateData: Partial<IVideo>): Promise<IVideo> {
    // Verify video exists
    await this.getVideoById(id);

    const updatedVideo = await videoRepository.update(id, updateData);
    if (!updatedVideo) {
      throw new AppError('Failed to update video', 500);
    }

    return updatedVideo;
  }

  /**
   * Delete video (Admin only) - Soft delete
   */
  async deleteVideo(id: string): Promise<IVideo> {
    await this.getVideoById(id);

    const deleted = await videoRepository.softDelete(id);
    if (!deleted) {
      throw new AppError('Failed to delete video', 500);
    }

    return deleted;
  }

  /**
   * Soft delete video (Admin only)
   */
  async deactivateVideo(id: string): Promise<IVideo> {
    await this.getVideoById(id);

    const deactivated = await videoRepository.softDelete(id);
    if (!deactivated) {
      throw new AppError('Failed to deactivate video', 500);
    }

    return deactivated;
  }

  /**
   * Publish video (Admin only)
   */
  async publishVideo(id: string): Promise<IVideo> {
    const video = await videoRepository.publish(id);
    if (!video) {
      throw new AppError('Video not found', 404);
    }
    return video;
  }

  /**
   * Unpublish video (Admin only)
   */
  async unpublishVideo(id: string): Promise<IVideo> {
    const video = await videoRepository.unpublish(id);
    if (!video) {
      throw new AppError('Video not found', 404);
    }
    return video;
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<IVideo> {
    const video = await videoRepository.incrementViewCount(id);
    if (!video) {
      throw new AppError('Video not found', 404);
    }
    return video;
  }

  /**
   * Like video
   */
  async likeVideo(id: string): Promise<IVideo> {
    const video = await videoRepository.incrementLikeCount(id);
    if (!video) {
      throw new AppError('Video not found', 404);
    }
    return video;
  }

  /**
   * Unlike video
   */
  async unlikeVideo(id: string): Promise<IVideo> {
    const video = await videoRepository.decrementLikeCount(id);
    if (!video) {
      throw new AppError('Video not found', 404);
    }
    return video;
  }

  /**
   * Get video statistics (Admin only)
   */
  async getVideoStats(): Promise<any> {
    return await videoRepository.getStats();
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    return await videoRepository.getCategories();
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<string[]> {
    return await videoRepository.getTags();
  }

  /**
   * Search videos
   */
  async searchVideos(
    searchTerm: string,
    options: PaginationOptions = {}
  ): Promise<{ videos: IVideo[]; total: number; page: number; totalPages: number }> {
    return await videoRepository.findAll(
      { search: searchTerm, isActive: true, isPublished: true },
      options
    );
  }
}

export default new VideoService();
