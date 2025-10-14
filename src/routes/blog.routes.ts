import { Router } from 'express';
import blogController from '../controllers/blog.controller';
import { authenticate, authorize, requireVerification } from '../middlewares/auth';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import { uploadSingle } from '../middlewares/upload';
import {
  createBlogSchema,
  updateBlogSchema,
  blogPaginationSchema,
  blogIdParamSchema,
  blogSlugParamSchema,
  blogTagsQuerySchema,
  searchBlogSchema,
} from '../validators/blog.validator';

const router = Router();

// ============= Public routes (special endpoints before others) =============
// Most viewed blogs
router.get('/most-viewed', blogController.getMostViewedBlogs);

// Recent blogs
router.get('/recent', blogController.getRecentBlogs);

// All tags
router.get('/tags', blogController.getAllTags);

// Search blogs
router.get('/search', validateQuery(searchBlogSchema), blogController.searchBlogs);

// Get blogs by slug (must come before /:id to avoid conflicts)
router.get('/slug/:slug', validateParams(blogSlugParamSchema), blogController.getBlogBySlug);

// Get blogs by category
router.get('/category/:categoryId', validateQuery(blogPaginationSchema), blogController.getBlogsByCategory);

// Get blogs by author (public - only published blogs)
router.get('/author/:authorId', validateQuery(blogPaginationSchema), blogController.getBlogsByAuthor);

// Get blogs by tags
router.get('/tags/filter', validateQuery(blogTagsQuerySchema), blogController.getBlogsByTags);

// ============= Authenticated routes =============
// Get my blogs (user's own blogs including drafts)
router.get(
  '/my-blogs',
  authenticate,
  requireVerification,
  validateQuery(blogPaginationSchema),
  blogController.getMyBlogs
);

// Get blog statistics
router.get(
  '/stats/overview',
  authenticate,
  requireVerification,
  blogController.getBlogStats
);

// Create blog (authenticated users with verification)
router.post(
  '/',
  authenticate,
  requireVerification,
  validate(createBlogSchema),
  blogController.createBlog
);

// ============= Public routes (general) =============
// Get all published blogs (public)
router.get('/', validateQuery(blogPaginationSchema), blogController.getAllBlogs);

// Get blog by ID (public for published, owner/admin for draft)
router.get('/:id', validateParams(blogIdParamSchema), blogController.getBlogById);

// ============= Owner/Admin routes =============
// Update blog (owner or admin)
router.patch(
  '/:id',
  authenticate,
  requireVerification,
  validateParams(blogIdParamSchema),
  validate(updateBlogSchema),
  blogController.updateBlog
);

// Publish blog (owner or admin)
router.post(
  '/:id/publish',
  authenticate,
  requireVerification,
  validateParams(blogIdParamSchema),
  blogController.publishBlog
);

// Delete blog - hard delete (owner or admin)
router.delete(
  '/:id',
  authenticate,
  requireVerification,
  validateParams(blogIdParamSchema),
  blogController.deleteBlog
);

// Soft delete blog - deactivate (owner or admin)
router.post(
  '/:id/deactivate',
  authenticate,
  requireVerification,
  validateParams(blogIdParamSchema),
  blogController.softDeleteBlog
);

export default router;
