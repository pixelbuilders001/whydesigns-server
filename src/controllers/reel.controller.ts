import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import reelService from '../services/reel.service';
import s3Service from '../services/s3.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';

class ReelController {
  /**
   * Create a new reel
   * @route POST /api/v1/reels
   * @access Private (Admin only)
   */
  createReel = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
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
    const videoUrl = await s3Service.uploadFile(videoFile, 'reels/videos');

    // Upload thumbnail to S3 if provided
    let thumbnailUrl: string | undefined;
    if (thumbnailFile) {
      thumbnailUrl = await s3Service.uploadFile(thumbnailFile, 'reels/thumbnails');
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

    // Create reel data
    const reelData = {
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

    const reel = await reelService.createReel(uploaderId, reelData);

    return ApiResponse.success(
      res,
      reel,
      'Reel created successfully',
      201
    );
  });

  /**
   * Get all reels with filters
   * @route GET /api/v1/reels/all
   * @access Private (Admin only)
   */
  getAllReels = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, isPublished, category, tags, search } = req.query;

    const filters: any = {};
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

    const result = await reelService.getAllReels(filters, options);

    return ApiResponse.success(
      res,
      result,
      'Reels retrieved successfully'
    );
  });

  /**
   * Get published reels
   * @route GET /api/v1/reels
   * @access Public
   */
  getPublishedReels = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = req.query;

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'publishedAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await reelService.getPublishedReels(options);

    return ApiResponse.success(
      res,
      result,
      'Published reels retrieved successfully'
    );
  });

  /**
   * Get reel by ID
   * @route GET /api/v1/reels/:id
   * @access Public
   */
  getReelById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const reel = await reelService.getReelById(id);

    return ApiResponse.success(
      res,
      reel,
      'Reel retrieved successfully'
    );
  });

  /**
   * Get reels by category
   * @route GET /api/v1/reels/category/:category
   * @access Public
   */
  getReelsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'publishedAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await reelService.getReelsByCategory(category, options);

    return ApiResponse.success(
      res,
      result,
      `Reels in category '${category}' retrieved successfully`
    );
  });

  /**
   * Get reels by tags
   * @route GET /api/v1/reels/tags
   * @access Public
   */
  getReelsByTags = asyncHandler(async (req: Request, res: Response) => {
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

    const result = await reelService.getReelsByTags(tagArray, options);

    return ApiResponse.success(
      res,
      result,
      'Reels with specified tags retrieved successfully'
    );
  });

  /**
   * Get most viewed reels
   * @route GET /api/v1/reels/trending/most-viewed
   * @access Public
   */
  getMostViewedReels = asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const reels = await reelService.getMostViewedReels(limit ? Number(limit) : 10);

    return ApiResponse.success(
      res,
      reels,
      'Most viewed reels retrieved successfully'
    );
  });

  /**
   * Get most liked reels
   * @route GET /api/v1/reels/trending/most-liked
   * @access Public
   */
  getMostLikedReels = asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const reels = await reelService.getMostLikedReels(limit ? Number(limit) : 10);

    return ApiResponse.success(
      res,
      reels,
      'Most liked reels retrieved successfully'
    );
  });

  /**
   * Get recent reels
   * @route GET /api/v1/reels/trending/recent
   * @access Public
   */
  getRecentReels = asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const reels = await reelService.getRecentReels(limit ? Number(limit) : 10);

    return ApiResponse.success(
      res,
      reels,
      'Recent reels retrieved successfully'
    );
  });

  /**
   * Search reels
   * @route GET /api/v1/reels/search
   * @access Public
   */
  searchReels = asyncHandler(async (req: Request, res: Response) => {
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

    const result = await reelService.searchReels(String(q), options);

    return ApiResponse.success(
      res,
      result,
      'Search results retrieved successfully'
    );
  });

  /**
   * Update reel
   * @route PATCH /api/v1/reels/:id
   * @access Private (Admin only)
   */
  updateReel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Get existing reel
    const existingReel = await reelService.getReelById(id);

    // Handle file uploads if present
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    let videoUrl = existingReel.videoUrl;
    let thumbnailUrl = existingReel.thumbnailUrl;

    // Upload new video if provided
    if (files && files.video && files.video.length > 0) {
      const videoFile = files.video[0];
      videoUrl = await s3Service.uploadFile(videoFile, 'reels/videos');

      // Delete old video from S3
      if (existingReel.videoUrl) {
        await s3Service.deleteFile(existingReel.videoUrl);
      }
    }

    // Upload new thumbnail if provided
    if (files && files.thumbnail && files.thumbnail.length > 0) {
      const thumbnailFile = files.thumbnail[0];
      thumbnailUrl = await s3Service.uploadFile(thumbnailFile, 'reels/thumbnails');

      // Delete old thumbnail from S3
      if (existingReel.thumbnailUrl) {
        await s3Service.deleteFile(existingReel.thumbnailUrl);
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

    const reel = await reelService.updateReel(id, updateData);

    return ApiResponse.success(
      res,
      reel,
      'Reel updated successfully'
    );
  });

  /**
   * Delete reel
   * @route DELETE /api/v1/reels/:id
   * @access Private (Admin only)
   */
  deleteReel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await reelService.deleteReel(id);

    return ApiResponse.success(
      res,
      null,
      'Reel deleted successfully'
    );
  });

  /**
   * Deactivate reel (soft delete)
   * @route POST /api/v1/reels/:id/deactivate
   * @access Private (Admin only)
   */
  deactivateReel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const reel = await reelService.deactivateReel(id);

    return ApiResponse.success(
      res,
      reel,
      'Reel deactivated successfully'
    );
  });

  /**
   * Publish reel
   * @route PATCH /api/v1/reels/:id/publish
   * @access Private (Admin only)
   */
  publishReel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const reel = await reelService.publishReel(id);

    return ApiResponse.success(
      res,
      reel,
      'Reel published successfully'
    );
  });

  /**
   * Unpublish reel
   * @route PATCH /api/v1/reels/:id/unpublish
   * @access Private (Admin only)
   */
  unpublishReel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const reel = await reelService.unpublishReel(id);

    return ApiResponse.success(
      res,
      reel,
      'Reel unpublished successfully'
    );
  });

  /**
   * Increment view count
   * @route POST /api/v1/reels/:id/view
   * @access Public
   */
  incrementViewCount = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const reel = await reelService.incrementViewCount(id);

    return ApiResponse.success(
      res,
      reel,
      'View count incremented'
    );
  });

  /**
   * Like reel
   * @route POST /api/v1/reels/:id/like
   * @access Public
   */
  likeReel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const reel = await reelService.likeReel(id);

    return ApiResponse.success(
      res,
      reel,
      'Reel liked successfully'
    );
  });

  /**
   * Unlike reel
   * @route POST /api/v1/reels/:id/unlike
   * @access Public
   */
  unlikeReel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const reel = await reelService.unlikeReel(id);

    return ApiResponse.success(
      res,
      reel,
      'Reel unliked successfully'
    );
  });

  /**
   * Get reel statistics
   * @route GET /api/v1/reels/stats/overview
   * @access Private (Admin only)
   */
  getReelStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await reelService.getReelStats();

    return ApiResponse.success(
      res,
      stats,
      'Reel statistics retrieved successfully'
    );
  });

  /**
   * Get all categories
   * @route GET /api/v1/reels/meta/categories
   * @access Public
   */
  getCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await reelService.getCategories();

    return ApiResponse.success(
      res,
      categories,
      'Categories retrieved successfully'
    );
  });

  /**
   * Get all tags
   * @route GET /api/v1/reels/meta/tags
   * @access Public
   */
  getTags = asyncHandler(async (_req: Request, res: Response) => {
    const tags = await reelService.getTags();

    return ApiResponse.success(
      res,
      tags,
      'Tags retrieved successfully'
    );
  });
}

export default new ReelController();
