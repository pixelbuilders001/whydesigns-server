import { Request, Response, NextFunction } from 'express';
import blogService from '../services/blog.service';
import s3Service from '../services/s3.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest, PaginationQuery } from '../types';
import { BlogStatus } from '../models/blog.model';

export class BlogController {
  createBlog = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    // Handle file upload if present
    let featuredImageUrl = '';
    if (req.file) {
      featuredImageUrl = await s3Service.uploadFile(req.file, 'blog-images');
    }

    const blogData = {
      ...req.body,
      authorId: userId,
      featuredImage: featuredImageUrl || req.body.featuredImage || '',
    };

    const blog = await blogService.createBlog(blogData);

    return ApiResponse.created(res, blog, 'Blog created successfully');
  });

  getAllBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as PaginationQuery & { search?: string; status?: BlogStatus; authorId?: string };
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';
    const search = query.search;

    let result;
    if (search && search.trim() !== '') {
      result = await blogService.searchBlogs(search, { page, limit, sortBy, order });
    } else {
      // Public endpoint - only show published blogs
      result = await blogService.getPublishedBlogs({ page, limit, sortBy, order });
    }

    return ApiResponse.paginated(
      res,
      result.blogs,
      page,
      limit,
      result.total,
      'Blogs retrieved successfully'
    );
  });

  getMyBlogs = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    const query = req.query as unknown as PaginationQuery & { status?: BlogStatus };
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';
    const status = query.status;

    const filters: any = {};
    if (status) filters.status = status;

    const result = await blogService.getMyBlogs(userId, { page, limit, sortBy, order }, filters);

    return ApiResponse.paginated(
      res,
      result.blogs,
      page,
      limit,
      result.total,
      'Your blogs retrieved successfully'
    );
  });

  getBlogById = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const blog = await blogService.getBlogById(id, userId, userRole);

    return ApiResponse.success(res, blog, 'Blog retrieved successfully');
  });

  getBlogBySlug = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { slug } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const blog = await blogService.getBlogBySlug(slug, userId, userRole);

    return ApiResponse.success(res, blog, 'Blog retrieved successfully');
  });

  getBlogsByAuthor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { authorId } = req.params;
    const query = req.query as unknown as PaginationQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';

    const result = await blogService.getBlogsByAuthor(authorId, { page, limit, sortBy, order });

    return ApiResponse.paginated(
      res,
      result.blogs,
      page,
      limit,
      result.total,
      'Blogs retrieved successfully'
    );
  });

  getBlogsByTags = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const tagsParam = req.query.tags;
    const tags = Array.isArray(tagsParam) ? tagsParam : [tagsParam as string];

    const query = req.query as unknown as PaginationQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';

    const result = await blogService.getBlogsByTags(tags, { page, limit, sortBy, order });

    return ApiResponse.paginated(
      res,
      result.blogs,
      page,
      limit,
      result.total,
      'Blogs retrieved successfully'
    );
  });

  searchBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as PaginationQuery & { q: string };
    const searchQuery = query.q;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';

    const result = await blogService.searchBlogs(searchQuery, { page, limit, sortBy, order });

    return ApiResponse.paginated(
      res,
      result.blogs,
      page,
      limit,
      result.total,
      'Search results retrieved successfully'
    );
  });

  updateBlog = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || '';

    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    // Handle file upload if present
    let featuredImageUrl = '';
    if (req.file) {
      featuredImageUrl = await s3Service.uploadFile(req.file, 'blog-images');

      // Get existing blog to delete old image
      const existingBlog = await blogService.getBlogById(id, userId, userRole);
      if (existingBlog.featuredImage) {
        await s3Service.deleteFile(existingBlog.featuredImage);
      }
    }

    const updateData = {
      ...req.body,
      ...(featuredImageUrl && { featuredImage: featuredImageUrl }),
    };

    const blog = await blogService.updateBlog(id, userId, userRole, updateData);

    return ApiResponse.success(res, blog, 'Blog updated successfully');
  });

  publishBlog = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || '';

    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    const blog = await blogService.publishBlog(id, userId, userRole);

    return ApiResponse.success(res, blog, 'Blog published successfully');
  });

  deleteBlog = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || '';

    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    await blogService.deleteBlog(id, userId, userRole);

    return ApiResponse.success(res, null, 'Blog deleted successfully');
  });

  softDeleteBlog = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role || '';

    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    const blog = await blogService.softDeleteBlog(id, userId, userRole);

    return ApiResponse.success(res, blog, 'Blog deactivated successfully');
  });

  getMostViewedBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string || '10', 10);
    const blogs = await blogService.getMostViewedBlogs(limit);

    return ApiResponse.success(res, blogs, 'Most viewed blogs retrieved successfully');
  });

  getRecentBlogs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string || '10', 10);
    const blogs = await blogService.getRecentBlogs(limit);

    return ApiResponse.success(res, blogs, 'Recent blogs retrieved successfully');
  });

  getAllTags = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const tags = await blogService.getAllTags();

    return ApiResponse.success(res, tags, 'Tags retrieved successfully');
  });

  getBlogStats = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // If user is not admin, only show their own stats
    const authorId = userRole === 'ADMIN' ? undefined : userId;

    const stats = await blogService.getBlogStats(authorId);

    return ApiResponse.success(res, stats, 'Blog statistics retrieved successfully');
  });
}

export default new BlogController();
