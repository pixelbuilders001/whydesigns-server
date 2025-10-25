import { Router } from 'express';
import bannerController from '../controllers/banner.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validateQuery, validateParams } from '../middlewares/validate';
import { uploadSingle } from '../middlewares/upload';
import {
  getBannersQuerySchema,
  bannerIdParamSchema,
} from '../validators/banner.validator';

const router = Router();

/**
 * Public routes
 */

// Get published banner group
router.get(
  '/published',
  bannerController.getPublishedBanner
);

// Get all banner groups with filters
router.get(
  '/',
  validateQuery(getBannersQuerySchema),
  bannerController.getAllBanners
);

// Get banner group by ID
router.get(
  '/:id',
  validateParams(bannerIdParamSchema),
  bannerController.getBannerById
);

/**
 * Admin only routes
 */

// Create banner
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  uploadSingle('image'),
  bannerController.createBanner
);

// Get statistics
router.get(
  '/stats/overview',
  authenticate,
  authorize('ADMIN'),
  bannerController.getBannerStats
);

// Update banner
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(bannerIdParamSchema),
  uploadSingle('image'),
  bannerController.updateBanner
);

// Publish banner group (unpublishes all others)
router.patch(
  '/:id/publish',
  authenticate,
  authorize('ADMIN'),
  validateParams(bannerIdParamSchema),
  bannerController.publishBanner
);

// Unpublish banner group
router.patch(
  '/:id/unpublish',
  authenticate,
  authorize('ADMIN'),
  validateParams(bannerIdParamSchema),
  bannerController.unpublishBanner
);

// Deactivate banner group
router.post(
  '/:id/deactivate',
  authenticate,
  authorize('ADMIN'),
  validateParams(bannerIdParamSchema),
  bannerController.deactivateBanner
);

// Delete banner group
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(bannerIdParamSchema),
  bannerController.deleteBanner
);

export default router;
