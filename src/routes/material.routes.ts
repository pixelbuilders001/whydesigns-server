import { Router } from 'express';
import materialController from '../controllers/material.controller';
import { authenticate, authorize, requireVerification } from '../middlewares/auth';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import { uploadMaterialSingle } from '../middlewares/upload';
import {
  createMaterialSchema,
  updateMaterialSchema,
  materialIdParamSchema,
  categoryParamSchema,
  materialPaginationSchema,
  searchQuerySchema,
} from '../validators/material.validator';

const router = Router();

// ============= Public Routes =============

/**
 * @route   GET /api/materials
 * @desc    Get all materials with pagination
 * @access  Public
 */
router.get(
  '/',
  validateQuery(materialPaginationSchema),
  materialController.getAll
);

/**
 * @route   GET /api/materials/search
 * @desc    Search materials
 * @access  Public
 * @note    Must be before /:id route to avoid conflicts
 */
router.get(
  '/search',
  validateQuery(searchQuerySchema),
  materialController.search
);

/**
 * @route   GET /api/materials/meta/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get(
  '/meta/categories',
  materialController.getCategories
);

/**
 * @route   GET /api/materials/meta/tags
 * @desc    Get all tags
 * @access  Public
 */
router.get(
  '/meta/tags',
  materialController.getTags
);

/**
 * @route   GET /api/materials/meta/stats
 * @desc    Get category statistics
 * @access  Public
 */
router.get(
  '/meta/stats',
  materialController.getCategoryStats
);

/**
 * @route   GET /api/materials/category/:category
 * @desc    Get materials by category
 * @access  Public
 */
router.get(
  '/category/:category',
  validateParams(categoryParamSchema),
  validateQuery(materialPaginationSchema),
  materialController.getByCategory
);

/**
 * @route   GET /api/materials/:id
 * @desc    Get material by ID
 * @access  Public
 */
router.get(
  '/:id',
  validateParams(materialIdParamSchema),
  materialController.getById
);

/**
 * @route   GET /api/materials/:id/download
 * @desc    Download material (tracks download count)
 * @access  Public
 */
router.get(
  '/:id/download',
  validateParams(materialIdParamSchema),
  materialController.download
);

// ============= Protected Routes (Admin Only) =============

/**
 * @route   POST /api/materials
 * @desc    Create a new material (upload file)
 * @access  Admin only
 */
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  uploadMaterialSingle('file'),
  validate(createMaterialSchema),
  materialController.create
);

/**
 * @route   PATCH /api/materials/:id
 * @desc    Update material by ID
 * @access  Admin only
 */
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateParams(materialIdParamSchema),
  uploadMaterialSingle('file'),
  validate(updateMaterialSchema),
  materialController.update
);

/**
 * @route   DELETE /api/materials/:id
 * @desc    Delete material by ID (hard delete)
 * @access  Admin only
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateParams(materialIdParamSchema),
  materialController.delete
);

/**
 * @route   POST /api/materials/:id/deactivate
 * @desc    Soft delete material by ID
 * @access  Admin only
 */
router.post(
  '/:id/deactivate',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateParams(materialIdParamSchema),
  materialController.softDelete
);

export default router;
