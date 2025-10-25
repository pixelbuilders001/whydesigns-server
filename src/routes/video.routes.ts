import { Router } from 'express';
import videoController from '../controllers/video.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validateQuery, validateParams } from '../middlewares/validate';
import { uploadVideoFiles } from '../middlewares/upload';
import {
  getVideosQuerySchema,
  videoIdParamSchema,
  categoryParamSchema,
  tagsQuerySchema,
  searchQuerySchema,
  limitQuerySchema,
} from '../validators/video.validator';

const router = Router();

/**
 * Public routes
 */

// Get published videos
router.get(
  '/',
  validateQuery(getVideosQuerySchema),
  videoController.getPublishedVideos
);

// Search videos
router.get(
  '/search',
  validateQuery(searchQuerySchema),
  videoController.searchVideos
);

// Get most viewed videos
router.get(
  '/trending/most-viewed',
  validateQuery(limitQuerySchema),
  videoController.getMostViewedVideos
);

// Get most liked videos
router.get(
  '/trending/most-liked',
  validateQuery(limitQuerySchema),
  videoController.getMostLikedVideos
);

// Get recent videos
router.get(
  '/trending/recent',
  validateQuery(limitQuerySchema),
  videoController.getRecentVideos
);

// Get all categories
router.get(
  '/meta/categories',
  videoController.getCategories
);

// Get all tags
router.get(
  '/meta/tags',
  videoController.getTags
);

// Get videos by category
router.get(
  '/category/:category',
  validateParams(categoryParamSchema),
  validateQuery(getVideosQuerySchema),
  videoController.getVideosByCategory
);

// Get videos by tags
router.get(
  '/tags',
  validateQuery(tagsQuerySchema),
  videoController.getVideosByTags
);

// Get video by ID
router.get(
  '/:id',
  validateParams(videoIdParamSchema),
  videoController.getVideoById
);

// Increment view count (public)
router.post(
  '/:id/view',
  validateParams(videoIdParamSchema),
  videoController.incrementViewCount
);

// Like video (public)
router.post(
  '/:id/like',
  validateParams(videoIdParamSchema),
  videoController.likeVideo
);

// Unlike video (public)
router.post(
  '/:id/unlike',
  validateParams(videoIdParamSchema),
  videoController.unlikeVideo
);

/**
 * Admin only routes
 */

// Create video
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  uploadVideoFiles,
  videoController.createVideo
);

// Get all videos (including unpublished)
router.get(
  '/all/videos',
  authenticate,
  authorize('ADMIN'),
  validateQuery(getVideosQuerySchema),
  videoController.getAllVideos
);

// Get statistics
router.get(
  '/stats/overview',
  authenticate,
  authorize('ADMIN'),
  videoController.getVideoStats
);

// Update video
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(videoIdParamSchema),
  uploadVideoFiles,
  videoController.updateVideo
);

// Publish video
router.patch(
  '/:id/publish',
  authenticate,
  authorize('ADMIN'),
  validateParams(videoIdParamSchema),
  videoController.publishVideo
);

// Unpublish video
router.patch(
  '/:id/unpublish',
  authenticate,
  authorize('ADMIN'),
  validateParams(videoIdParamSchema),
  videoController.unpublishVideo
);

// Deactivate video
router.post(
  '/:id/deactivate',
  authenticate,
  authorize('ADMIN'),
  validateParams(videoIdParamSchema),
  videoController.deactivateVideo
);

// Delete video
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(videoIdParamSchema),
  videoController.deleteVideo
);

export default router;
