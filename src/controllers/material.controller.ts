import { Request, Response, NextFunction } from 'express';
import materialService from '../services/material.service';
import s3Service from '../services/s3.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { PaginationQuery } from '../types';
import { BadRequestError } from '../utils/AppError';

/**
 * Material Controller
 * Handles HTTP requests for materials
 */
export class MaterialController {
  /**
   * Create a new material
   * POST /materials
   * @access Admin only
   */
  create = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Check if file is uploaded
    if (!req.file) {
      throw new BadRequestError('File is required');
    }

    // Upload file to S3
    const fileUrl = await s3Service.uploadFile(req.file, 'materials');

    // Get uploader ID from authenticated user
    const uploadedBy = (req as any).user?.id;
    if (!uploadedBy) {
      throw new BadRequestError('User authentication required');
    }

    // Prepare material data
    const data = {
      name: req.body.name || req.body.title,
      description: req.body.description || '',
      fileUrl,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      category: req.body.category || 'General',
      uploadedBy,
    };

    // Create material
    const material = await materialService.create(data);

    return ApiResponse.created(res, material, 'Material uploaded successfully');
  });

  /**
   * Get all materials with pagination
   * GET /materials
   * @access Public
   */
  getAll = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as PaginationQuery & { isActive?: string };
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';

    const filters: any = {};
    if (query.isActive !== undefined) filters.isActive = query.isActive === 'true';

    const result = await materialService.getAllWithUser({ page, limit, sortBy, order }, filters);

    return ApiResponse.paginated(
      res,
      result.items,
      page,
      limit,
      result.total,
      'Materials retrieved successfully'
    );
  });

  /**
   * Get material by ID
   * GET /materials/:id
   * @access Public
   */
  getById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const material = await materialService.getByIdWithUser(id);

    return ApiResponse.success(res, material, 'Material retrieved successfully');
  });

  /**
   * Get materials by category
   * GET /materials/category/:category
   * @access Public
   */
  getByCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.params;
    const query = req.query as unknown as PaginationQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';

    const result = await materialService.getByCategory(category, { page, limit, sortBy, order });

    return ApiResponse.paginated(
      res,
      result.items,
      page,
      limit,
      result.total,
      `Materials in category "${category}" retrieved successfully`
    );
  });

  /**
   * Search materials
   * GET /materials/search?q=query
   * @access Public
   */
  search = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as any;
    const searchQuery = query.q || query.query || '';
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';

    if (!searchQuery) {
      throw new BadRequestError('Search query is required');
    }

    const result = await materialService.search(searchQuery, { page, limit, sortBy, order });

    return ApiResponse.paginated(
      res,
      result.items,
      page,
      limit,
      result.total,
      'Search results retrieved successfully'
    );
  });

  /**
   * Update material
   * PATCH /materials/:id
   * @access Admin only
   */
  update = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Handle file upload if present
    let fileUrl = '';
    let fileName = '';
    let fileType = '';
    let fileSize = 0;

    if (req.file) {
      // Upload new file to S3
      fileUrl = await s3Service.uploadFile(req.file, 'materials');
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
      fileSize = req.file.size;

      // Delete old file from S3
      const existing = await materialService.getById(id);
      if (existing.fileUrl) {
        await s3Service.deleteFile(existing.fileUrl);
      }
    }

    // Prepare update data
    const data: any = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      tags: req.body.tags ? (Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags]) : undefined,
      isActive: req.body.isActive,
    };

    // Add file data if new file was uploaded
    if (fileUrl) {
      data.fileUrl = fileUrl;
      data.fileName = fileName;
      data.fileType = fileType;
      data.fileSize = fileSize;
    }

    // Remove undefined values
    Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

    // Update material
    const material = await materialService.update(id, data);

    return ApiResponse.success(res, material, 'Material updated successfully');
  });

  /**
   * Delete material (hard delete)
   * DELETE /materials/:id
   * @access Admin only
   */
  delete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Get material to delete file from S3
    const material = await materialService.getById(id);

    // Delete file from S3
    if (material.fileUrl) {
      await s3Service.deleteFile(material.fileUrl);
    }

    // Delete material from database
    await materialService.delete(id);

    return ApiResponse.success(res, null, 'Material deleted successfully');
  });

  /**
   * Soft delete material
   * POST /materials/:id/deactivate
   * @access Admin only
   */
  softDelete = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const material = await materialService.softDelete(id);

    return ApiResponse.success(res, material, 'Material deactivated successfully');
  });

  /**
   * Download material (tracks download count)
   * GET /materials/:id/download
   * @access Public
   */
  download = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    // Track download
    const material = await materialService.trackDownload(id);

    // Return material with file URL
    return ApiResponse.success(res, material, 'Material download tracked successfully');
  });

  /**
   * Get all categories
   * GET /materials/meta/categories
   * @access Public
   */
  getCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const categories = await materialService.getCategories();

    return ApiResponse.success(res, categories, 'Categories retrieved successfully');
  });

  /**
   * Get all tags
   * GET /materials/meta/tags
   * @access Public
   */
  getTags = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Tags feature has been removed from materials
    return ApiResponse.success(res, [], 'Tags feature is no longer available');
  });

  /**
   * Get category statistics
   * GET /materials/meta/stats
   * @access Public
   */
  getCategoryStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await materialService.getCategoryStats();

    return ApiResponse.success(res, stats, 'Statistics retrieved successfully');
  });

  /**
   * Publish material
   * PATCH /materials/:id/publish
   * @access Private (Admin only)
   */
  publishMaterial = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const material = await materialService.publishMaterial(id);

    return ApiResponse.success(res, material, 'Material published successfully');
  });

  /**
   * Unpublish material
   * PATCH /materials/:id/unpublish
   * @access Private (Admin only)
   */
  unpublishMaterial = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const material = await materialService.unpublishMaterial(id);

    return ApiResponse.success(res, material, 'Material unpublished successfully');
  });
}

export default new MaterialController();
