import { Router } from 'express';
import bannerController from '../controllers/banner.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate, validateQuery, validateParams } from '../middlewares/validate';
import { uploadMultiple } from '../middlewares/upload';
import {
  createBannerSchema,
  updateBannerSchema,
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

// Create banner group
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  uploadMultiple('banners', 10),
  validate(createBannerSchema),
  bannerController.createBanner
);

// Get statistics
router.get(
  '/stats/overview',
  authenticate,
  authorize('ADMIN'),
  bannerController.getBannerStats
);

// Update banner group
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(bannerIdParamSchema),
  uploadMultiple('banners', 10),
  validate(updateBannerSchema),
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
