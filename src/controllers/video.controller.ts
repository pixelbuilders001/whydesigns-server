import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import videoService from '../services/video.service';
import s3Service from '../services/s3.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';

class VideoController {
  /**
   * Create a new video
   * @route POST /api/v1/videos
   * @access Private (Admin only)
   */
  createVideo = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const uploaderId = req.user?.id;
    if (!uploaderId) {
      throw new AppError('User not authenticated', 401);
    }

    // Handle file uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files || !files.video || files.video.length === 0) {
      throw new AppError('Video file is required', 400);
    }

    const videoFile = files.video[0];
    const thumbnailFile = files.thumbnail ? files.thumbnail[0] : null;

    // Upload video to S3
    const videoUrl = await s3Service.uploadFile(videoFile, 'videos/videos');

    // Upload thumbnail to S3 if provided
    let thumbnailUrl: string | undefined;
    if (thumbnailFile) {
      thumbnailUrl = await s3Service.uploadFile(thumbnailFile, 'videos/thumbnails');
    }

    // Parse tags if provided as JSON string
    let tags: string[] | undefined;
    if (req.body.tags) {
      try {
        tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
      } catch (error) {
        throw new AppError('Invalid tags format. Expected JSON array', 400);
      }
    }

    // Create video data
    const videoData = {
      title: req.body.title,
      description: req.body.description,
      videoUrl,
      thumbnailUrl,
      duration: parseInt(req.body.duration),
      fileSize: videoFile.size,
      tags,
      category: req.body.category,
      isPublished: req.body.isPublished === 'true',
      displayOrder: req.body.displayOrder ? parseInt(req.body.displayOrder) : undefined,
    };

    const video = await videoService.createVideo(uploaderId, videoData);

    return ApiResponse.success(
      res,
      video,
      'Video created successfully',
      201
    );
  });

  /**
   * Get all videos with filters
   * @route GET /api/v1/videos
   * @access Public (Use query params like isPublished=true, isActive=true to filter)
   */
  getAllVideos = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, isPublished, category, tags, search, isActive } = req.query;

    const filters: any = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (isPublished !== undefined) filters.isPublished = isPublished === 'true';
    if (category) filters.category = String(category);
    if (tags) filters.tags = String(tags);
    if (search) filters.search = String(search);

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await videoService.getAllVideos(filters, options);

    return ApiResponse.success(
      res,
      result,
      'Videos retrieved successfully'
    );
  });

  /**
   * Get published videos
   * @route GET /api/v1/videos
   * @access Public
   */
  getPublishedVideos = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = req.query;

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'publishedAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await videoService.getPublishedVideos(options);

    return ApiResponse.success(
      res,
      result,
      'Published videos retrieved successfully'
    );
  });

  /**
   * Get video by ID
   * @route GET /api/v1/videos/:id
   * @access Public
   */
  getVideoById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const video = await videoService.getVideoById(id);

    return ApiResponse.success(
      res,
      video,
      'Video retrieved successfully'
    );
  });

  /**
   * Get videos by category
   * @route GET /api/v1/videos/category/:category
   * @access Public
   */
  getVideosByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'publishedAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await videoService.getVideosByCategory(category, options);

    return ApiResponse.success(
      res,
      result,
      `Videos in category '${category}' retrieved successfully`
    );
  });

  /**
   * Get videos by tags
   * @route GET /api/v1/videos/tags
   * @access Public
   */
  getVideosByTags = asyncHandler(async (req: Request, res: Response) => {
    const { tags, page, limit, sortBy, sortOrder } = req.query;

    if (!tags) {
      throw new AppError('Tags parameter is required', 400);
    }

    const tagArray = String(tags).split(',').map(tag => tag.trim());

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'publishedAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await videoService.getVideosByTags(tagArray, options);

    return ApiResponse.success(
      res,
      result,
      'Videos with specified tags retrieved successfully'
    );
  });

  /**
   * Get most viewed videos
   * @route GET /api/v1/videos/trending/most-viewed
   * @access Public
   */
  getMostViewedVideos = asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const videos = await videoService.getMostViewedVideos(limit ? Number(limit) : 10);

    return ApiResponse.success(
      res,
      videos,
      'Most viewed videos retrieved successfully'
    );
  });

  /**
   * Get most liked videos
   * @route GET /api/v1/videos/trending/most-liked
   * @access Public
   */
  getMostLikedVideos = asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const videos = await videoService.getMostLikedVideos(limit ? Number(limit) : 10);

    return ApiResponse.success(
      res,
      videos,
      'Most liked videos retrieved successfully'
    );
  });

  /**
   * Get recent videos
   * @route GET /api/v1/videos/trending/recent
   * @access Public
   */
  getRecentVideos = asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const videos = await videoService.getRecentVideos(limit ? Number(limit) : 10);

    return ApiResponse.success(
      res,
      videos,
      'Recent videos retrieved successfully'
    );
  });

  /**
   * Search videos
   * @route GET /api/v1/videos/search
   * @access Public
   */
  searchVideos = asyncHandler(async (req: Request, res: Response) => {
    const { q, page, limit, sortBy, sortOrder } = req.query;

    if (!q) {
      throw new AppError('Search query is required', 400);
    }

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await videoService.searchVideos(String(q), options);

    return ApiResponse.success(
      res,
      result,
      'Search results retrieved successfully'
    );
  });

  /**
   * Update video
   * @route PATCH /api/v1/videos/:id
   * @access Private (Admin only)
   */
  updateVideo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Get existing video
    const existingVideo = await videoService.getVideoById(id);

    // Handle file uploads if present
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let videoUrl = existingVideo.videoUrl;
    let thumbnailUrl = existingVideo.thumbnailUrl;

    // Upload new video if provided
    if (files && files.video && files.video.length > 0) {
      const videoFile = files.video[0];
      videoUrl = await s3Service.uploadFile(videoFile, 'videos/videos');

      // Delete old video from S3
      if (existingVideo.videoUrl) {
        await s3Service.deleteFile(existingVideo.videoUrl);
      }
    }

    // Upload new thumbnail if provided
    if (files && files.thumbnail && files.thumbnail.length > 0) {
      const thumbnailFile = files.thumbnail[0];
      thumbnailUrl = await s3Service.uploadFile(thumbnailFile, 'videos/thumbnails');

      // Delete old thumbnail from S3
      if (existingVideo.thumbnailUrl) {
        await s3Service.deleteFile(existingVideo.thumbnailUrl);
      }
    }

    // Parse tags if provided as JSON string
    let tags = req.body.tags;
    if (tags && typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (error) {
        throw new AppError('Invalid tags format. Expected JSON array', 400);
      }
    }

    // Build update data
    const updateData: any = {
      ...req.body,
      videoUrl,
      thumbnailUrl,
      tags,
    };

    // Parse numeric fields if they're strings
    if (updateData.duration) {
      updateData.duration = parseInt(updateData.duration);
    }
    if (updateData.displayOrder) {
      updateData.displayOrder = parseInt(updateData.displayOrder);
    }
    if (updateData.isPublished === 'true') {
      updateData.isPublished = true;
    } else if (updateData.isPublished === 'false') {
      updateData.isPublished = false;
    }

    // Update file size if new video was uploaded
    if (files && files.video && files.video.length > 0) {
      updateData.fileSize = files.video[0].size;
    }

    const video = await videoService.updateVideo(id, updateData);

    return ApiResponse.success(
      res,
      video,
      'Video updated successfully'
    );
  });

  /**
   * Delete video
   * @route DELETE /api/v1/videos/:id
   * @access Private (Admin only)
   */
  deleteVideo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await videoService.deleteVideo(id);

    return ApiResponse.success(
      res,
      null,
      'Video deleted successfully'
    );
  });

  /**
   * Deactivate video (soft delete)
   * @route POST /api/v1/videos/:id/deactivate
   * @access Private (Admin only)
   */
  deactivateVideo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const video = await videoService.deactivateVideo(id);

    return ApiResponse.success(
      res,
      video,
      'Video deactivated successfully'
    );
  });

  /**
   * Publish video
   * @route PATCH /api/v1/videos/:id/publish
   * @access Private (Admin only)
   */
  publishVideo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const video = await videoService.publishVideo(id);

    return ApiResponse.success(
      res,
      video,
      'Video published successfully'
    );
  });

  /**
   * Unpublish video
   * @route PATCH /api/v1/videos/:id/unpublish
   * @access Private (Admin only)
   */
  unpublishVideo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const video = await videoService.unpublishVideo(id);

    return ApiResponse.success(
      res,
      video,
      'Video unpublished successfully'
    );
  });

  /**
   * Increment view count
   * @route POST /api/v1/videos/:id/view
   * @access Public
   */
  incrementViewCount = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const video = await videoService.incrementViewCount(id);

    return ApiResponse.success(
      res,
      video,
      'View count incremented'
    );
  });

  /**
   * Like video
   * @route POST /api/v1/videos/:id/like
   * @access Public
   */
  likeVideo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const video = await videoService.likeVideo(id);

    return ApiResponse.success(
      res,
      video,
      'Video liked successfully'
    );
  });

  /**
   * Unlike video
   * @route POST /api/v1/videos/:id/unlike
   * @access Public
   */
  unlikeVideo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const video = await videoService.unlikeVideo(id);

    return ApiResponse.success(
      res,
      video,
      'Video unliked successfully'
    );
  });

  /**
   * Get video statistics
   * @route GET /api/v1/videos/stats/overview
   * @access Private (Admin only)
   */
  getVideoStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await videoService.getVideoStats();

    return ApiResponse.success(
      res,
      stats,
      'Video statistics retrieved successfully'
    );
  });

  /**
   * Get all categories
   * @route GET /api/v1/videos/meta/categories
   * @access Public
   */
  getCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await videoService.getCategories();

    return ApiResponse.success(
      res,
      categories,
      'Categories retrieved successfully'
    );
  });

  /**
   * Get all tags
   * @route GET /api/v1/videos/meta/tags
   * @access Public
   */
  getTags = asyncHandler(async (_req: Request, res: Response) => {
    const tags = await videoService.getTags();

    return ApiResponse.success(
      res,
      tags,
      'Tags retrieved successfully'
    );
  });
}

export default new VideoController();
