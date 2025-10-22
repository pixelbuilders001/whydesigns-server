import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import testimonialService from '../services/testimonial.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';

class TestimonialController {
  /**
   * Create a new testimonial
   * @route POST /api/v1/testimonials
   * @access Public (Anyone can create)
   */
  createTestimonial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // userId is optional - can be null for guest testimonials
    const userId = req.user?.id || null;

    const testimonial = await testimonialService.createTestimonial(userId, req.body);

    return ApiResponse.success(
      res,
      testimonial,
      'Testimonial created successfully. It will be visible after admin approval.',
      201
    );
  });

  /**
   * Get all testimonials (with filters)
   * @route GET /api/v1/testimonials
   * @access Public
   */
  getAllTestimonials = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, isApproved, isFavorite, rating, city, state, search } = req.query;

    const filters: any = {};
    if (isApproved !== undefined) filters.isApproved = isApproved === 'true';
    if (isFavorite !== undefined) filters.isFavorite = isFavorite === 'true';
    if (rating) filters.rating = Number(rating);
    if (city) filters.city = String(city);
    if (state) filters.state = String(state);
    if (search) filters.search = String(search);

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await testimonialService.getAllTestimonials(filters, options);

    return ApiResponse.success(
      res,
      result,
      'Testimonials retrieved successfully'
    );
  });

  /**
   * Get approved testimonials (public)
   * @route GET /api/v1/testimonials/approved
   * @access Public
   */
  getApprovedTestimonials = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = req.query;

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await testimonialService.getApprovedTestimonials(options);

    return ApiResponse.success(
      res,
      result,
      'Approved testimonials retrieved successfully'
    );
  });

  /**
   * Get favorite testimonials
   * @route GET /api/v1/testimonials/favorites
   * @access Public
   */
  getFavoriteTestimonials = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder } = req.query;

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'displayOrder',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
    };

    const result = await testimonialService.getFavoriteTestimonials(options);

    return ApiResponse.success(
      res,
      result,
      'Favorite testimonials retrieved successfully'
    );
  });

  /**
   * Get testimonial by ID
   * @route GET /api/v1/testimonials/:id
   * @access Public
   */
  getTestimonialById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const testimonial = await testimonialService.getTestimonialById(id);

    return ApiResponse.success(
      res,
      testimonial,
      'Testimonial retrieved successfully'
    );
  });

  /**
   * Get current user's testimonials
   * @route GET /api/v1/testimonials/my-testimonials
   * @access Private
   */
  getMyTestimonials = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const testimonials = await testimonialService.getTestimonialsByUser(userId);

    return ApiResponse.success(
      res,
      testimonials,
      'Your testimonials retrieved successfully'
    );
  });

  /**
   * Get testimonials by rating
   * @route GET /api/v1/testimonials/rating/:rating
   * @access Public
   */
  getTestimonialsByRating = asyncHandler(async (req: Request, res: Response) => {
    const { rating } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await testimonialService.getTestimonialsByRating(Number(rating), options);

    return ApiResponse.success(
      res,
      result,
      `Testimonials with ${rating} star rating retrieved successfully`
    );
  });

  /**
   * Get testimonials by location
   * @route GET /api/v1/testimonials/location
   * @access Public
   */
  getTestimonialsByLocation = asyncHandler(async (req: Request, res: Response) => {
    const { city, state, page, limit, sortBy, sortOrder } = req.query;

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await testimonialService.getTestimonialsByLocation(
      city ? String(city) : undefined,
      state ? String(state) : undefined,
      options
    );

    return ApiResponse.success(
      res,
      result,
      'Testimonials retrieved successfully by location'
    );
  });

  /**
   * Search testimonials
   * @route GET /api/v1/testimonials/search
   * @access Public
   */
  searchTestimonials = asyncHandler(async (req: Request, res: Response) => {
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

    const result = await testimonialService.searchTestimonials(String(q), options);

    return ApiResponse.success(
      res,
      result,
      'Search results retrieved successfully'
    );
  });

  /**
   * Update testimonial
   * @route PATCH /api/v1/testimonials/:id
   * @access Private (Owner or Admin)
   */
  updateTestimonial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const testimonial = await testimonialService.updateTestimonial(id, userId, req.body, isAdmin);

    return ApiResponse.success(
      res,
      testimonial,
      'Testimonial updated successfully'
    );
  });

  /**
   * Delete testimonial
   * @route DELETE /api/v1/testimonials/:id
   * @access Private (Owner or Admin)
   */
  deleteTestimonial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    await testimonialService.deleteTestimonial(id, userId, isAdmin);

    return ApiResponse.success(
      res,
      null,
      'Testimonial deleted successfully'
    );
  });

  /**
   * Deactivate testimonial (soft delete)
   * @route POST /api/v1/testimonials/:id/deactivate
   * @access Private (Owner or Admin)
   */
  deactivateTestimonial = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const testimonial = await testimonialService.deactivateTestimonial(id, userId, isAdmin);

    return ApiResponse.success(
      res,
      testimonial,
      'Testimonial deactivated successfully'
    );
  });

  /**
   * Toggle favorite status
   * @route PATCH /api/v1/testimonials/:id/favorite
   * @access Private (Admin only)
   */
  toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const testimonial = await testimonialService.toggleFavorite(id);

    return ApiResponse.success(
      res,
      testimonial,
      `Testimonial ${testimonial.isFavorite ? 'added to' : 'removed from'} favorites`
    );
  });

  /**
   * Approve testimonial
   * @route PATCH /api/v1/testimonials/:id/approve
   * @access Private (Admin only)
   */
  approveTestimonial = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const testimonial = await testimonialService.approveTestimonial(id);

    return ApiResponse.success(
      res,
      testimonial,
      'Testimonial approved successfully'
    );
  });

  /**
   * Reject testimonial
   * @route PATCH /api/v1/testimonials/:id/reject
   * @access Private (Admin only)
   */
  rejectTestimonial = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const testimonial = await testimonialService.rejectTestimonial(id);

    return ApiResponse.success(
      res,
      testimonial,
      'Testimonial rejected successfully'
    );
  });

  /**
   * Get testimonial statistics
   * @route GET /api/v1/testimonials/stats/overview
   * @access Private (Admin only)
   */
  getTestimonialStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await testimonialService.getTestimonialStats();

    return ApiResponse.success(
      res,
      stats,
      'Testimonial statistics retrieved successfully'
    );
  });
}

export default new TestimonialController();
