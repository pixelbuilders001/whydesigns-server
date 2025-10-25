import { Router } from 'express';
import reelController from '../controllers/reel.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validateQuery, validateParams } from '../middlewares/validate';
import { uploadReelFiles } from '../middlewares/upload';
import {
  getReelsQuerySchema,
  reelIdParamSchema,
  categoryParamSchema,
  tagsQuerySchema,
  searchQuerySchema,
  limitQuerySchema,
} from '../validators/reel.validator';

const router = Router();

/**
 * Public routes
 */

// Get all reels with filters (use isPublished=true for published reels)
router.get(
  '/',
  validateQuery(getReelsQuerySchema),
  reelController.getAllReels
);

// Search reels
router.get(
  '/search',
  validateQuery(searchQuerySchema),
  reelController.searchReels
);

// Get most viewed reels
router.get(
  '/trending/most-viewed',
  validateQuery(limitQuerySchema),
  reelController.getMostViewedReels
);

// Get most liked reels
router.get(
  '/trending/most-liked',
  validateQuery(limitQuerySchema),
  reelController.getMostLikedReels
);

// Get recent reels
router.get(
  '/trending/recent',
  validateQuery(limitQuerySchema),
  reelController.getRecentReels
);

// Get all categories
router.get(
  '/meta/categories',
  reelController.getCategories
);

// Get all tags
router.get(
  '/meta/tags',
  reelController.getTags
);

// Get reels by category
router.get(
  '/category/:category',
  validateParams(categoryParamSchema),
  validateQuery(getReelsQuerySchema),
  reelController.getReelsByCategory
);

// Get reels by tags
router.get(
  '/tags',
  validateQuery(tagsQuerySchema),
  reelController.getReelsByTags
);

// Get reel by ID
router.get(
  '/:id',
  validateParams(reelIdParamSchema),
  reelController.getReelById
);

// Increment view count (public)
router.post(
  '/:id/view',
  validateParams(reelIdParamSchema),
  reelController.incrementViewCount
);

// Like reel (public)
router.post(
  '/:id/like',
  validateParams(reelIdParamSchema),
  reelController.likeReel
);

// Unlike reel (public)
router.post(
  '/:id/unlike',
  validateParams(reelIdParamSchema),
  reelController.unlikeReel
);

/**
 * Admin only routes
 */

// Create reel
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  uploadReelFiles,
  reelController.createReel
);

// Get statistics
router.get(
  '/stats/overview',
  authenticate,
  authorize('ADMIN'),
  reelController.getReelStats
);

// Update reel
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(reelIdParamSchema),
  uploadReelFiles,
  reelController.updateReel
);

// Publish reel
router.patch(
  '/:id/publish',
  authenticate,
  authorize('ADMIN'),
  validateParams(reelIdParamSchema),
  reelController.publishReel
);

// Unpublish reel
router.patch(
  '/:id/unpublish',
  authenticate,
  authorize('ADMIN'),
  validateParams(reelIdParamSchema),
  reelController.unpublishReel
);

// Deactivate reel
router.post(
  '/:id/deactivate',
  authenticate,
  authorize('ADMIN'),
  validateParams(reelIdParamSchema),
  reelController.deactivateReel
);

// Delete reel
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(reelIdParamSchema),
  reelController.deleteReel
);

export default router;
