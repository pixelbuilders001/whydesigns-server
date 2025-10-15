import { Router } from 'express';
import categoryController from '../controllers/category.controller';
import { authenticate, authorize, requireVerification } from '../middlewares/auth';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryPaginationSchema,
  categoryIdParamSchema,
  categorySlugParamSchema,
} from '../validators/category.validator';

const router = Router();

// ============= Admin routes (require authentication, verification, and admin role) =============
// Get category statistics - must come before other routes to avoid conflicts
router.get(
  '/stats/overview',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  categoryController.getCategoryStats
);

// ============= Public routes =============
// Get all categories (public can only see active categories)
router.get(
  '/',
  validateQuery(categoryPaginationSchema),
  categoryController.getAllCategories
);

// Get category by slug (public) - must come before /:id route
router.get(
  '/slug/:slug',
  validateParams(categorySlugParamSchema),
  categoryController.getCategoryBySlug
);

// Get category by ID (public)
router.get(
  '/:id',
  validateParams(categoryIdParamSchema),
  categoryController.getCategoryById
);

// ============= Admin routes (create, update, delete) =============
// Create category
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validate(createCategorySchema),
  categoryController.createCategory
);

// Update category
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateParams(categoryIdParamSchema),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

// Delete category (hard delete)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateParams(categoryIdParamSchema),
  categoryController.deleteCategory
);

// Soft delete category (deactivate)
router.post(
  '/:id/deactivate',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateParams(categoryIdParamSchema),
  categoryController.softDeleteCategory
);

export default router;
