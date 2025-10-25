import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import bannerService from '../services/banner.service';
import s3Service from '../services/s3.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';

class BannerController {
  /**
   * Create a new banner
   * @route POST /api/v1/banners
   * @access Private (Admin only)
   */
  createBanner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const createdBy = req.user?.id;
    if (!createdBy) {
      throw new AppError('User not authenticated', 401);
    }

    // Validate required fields
    if (!req.body.title || req.body.title.trim().length < 2) {
      throw new AppError('Title is required and must be at least 2 characters long', 400);
    }

    if (req.body.title.length > 100) {
      throw new AppError('Title cannot exceed 100 characters', 400);
    }

    if (req.body.description && req.body.description.length > 500) {
      throw new AppError('Description cannot exceed 500 characters', 400);
    }

    // Handle banner image upload
    const file = req.file;

    if (!file) {
      throw new AppError('Banner image is required', 400);
    }

    // Upload banner image to S3
    const imageUrl = await s3Service.uploadFile(file, 'banners');

    const bannerData = {
      title: req.body.title,
      description: req.body.description,
      imageUrl,
      link: req.body.link || '',
      altText: req.body.altText || '',
    };

    const banner = await bannerService.createBanner(createdBy, bannerData);

    return ApiResponse.success(
      res,
      banner,
      'Banner created successfully',
      201
    );
  });

  /**
   * Get all banner groups with filters
   * @route GET /api/v1/banners
   * @access Public (Use query params to filter)
   */
  getAllBanners = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, isPublished, isActive, search } = req.query;

    const filters: any = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (isPublished !== undefined) filters.isPublished = isPublished === 'true';
    if (search) filters.search = String(search);

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await bannerService.getAllBanners(filters, options);

    return ApiResponse.success(
      res,
      result,
      'Banners retrieved successfully'
    );
  });

  /**
   * Get published banner group
   * @route GET /api/v1/banners/published
   * @access Public
   */
  getPublishedBanner = asyncHandler(async (req: Request, res: Response) => {
    const banner = await bannerService.getPublishedBanner();

    if (!banner) {
      return ApiResponse.success(
        res,
        null,
        'No published banner group found'
      );
    }

    return ApiResponse.success(
      res,
      banner,
      'Published banner group retrieved successfully'
    );
  });

  /**
   * Get banner group by ID
   * @route GET /api/v1/banners/:id
   * @access Public
   */
  getBannerById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const banner = await bannerService.getBannerById(id);

    return ApiResponse.success(
      res,
      banner,
      'Banner group retrieved successfully'
    );
  });

  /**
   * Update banner
   * @route PATCH /api/v1/banners/:id
   * @access Private (Admin only)
   */
  updateBanner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Handle new banner image upload if provided
    const file = req.file;

    let updateData: any = {
      ...req.body,
    };

    // If new image is uploaded, replace the old one
    if (file) {
      // Upload new banner image to S3
      const imageUrl = await s3Service.uploadFile(file, 'banners');
      updateData.imageUrl = imageUrl;

      // Delete old banner image from S3
      const oldBanner = await bannerService.getBannerById(id);
      if (oldBanner.imageUrl) {
        await s3Service.deleteFile(oldBanner.imageUrl);
      }
    }

    const banner = await bannerService.updateBanner(id, updateData);

    return ApiResponse.success(
      res,
      banner,
      'Banner updated successfully'
    );
  });

  /**
   * Delete banner group
   * @route DELETE /api/v1/banners/:id
   * @access Private (Admin only)
   */
  deleteBanner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    await bannerService.deleteBanner(id);

    return ApiResponse.success(
      res,
      null,
      'Banner group deleted successfully'
    );
  });

  /**
   * Deactivate banner group (soft delete)
   * @route POST /api/v1/banners/:id/deactivate
   * @access Private (Admin only)
   */
  deactivateBanner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const banner = await bannerService.deactivateBanner(id);

    return ApiResponse.success(
      res,
      banner,
      'Banner group deactivated successfully'
    );
  });

  /**
   * Publish banner group (unpublishes all others)
   * @route PATCH /api/v1/banners/:id/publish
   * @access Private (Admin only)
   */
  publishBanner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const banner = await bannerService.publishBanner(id);

    return ApiResponse.success(
      res,
      banner,
      'Banner group published successfully. All other banner groups have been unpublished.'
    );
  });

  /**
   * Unpublish banner group
   * @route PATCH /api/v1/banners/:id/unpublish
   * @access Private (Admin only)
   */
  unpublishBanner = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const banner = await bannerService.unpublishBanner(id);

    return ApiResponse.success(
      res,
      banner,
      'Banner group unpublished successfully'
    );
  });

  /**
   * Get banner statistics
   * @route GET /api/v1/banners/stats/overview
   * @access Private (Admin only)
   */
  getBannerStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await bannerService.getBannerStats();

    return ApiResponse.success(
      res,
      stats,
      'Banner statistics retrieved successfully'
    );
  });
}

export default new BannerController();
