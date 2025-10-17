import { Router } from 'express';
import counselorController from '../controllers/counselor.controller';
import { authenticate, authorize, requireVerification } from '../middlewares/auth';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import { uploadSingle } from '../middlewares/upload';
import {
  createCounselorSchema,
  updateCounselorSchema,
  updateCounselorRatingSchema,
  counselorPaginationSchema,
  counselorIdParamSchema,
  topCounselorsQuerySchema,
} from '../validators/counselor.validator';

const router = Router();

// ============= Public routes (special endpoints before others) =============
// Top rated counselors
router.get('/top-rated', validateQuery(topCounselorsQuerySchema), counselorController.getTopRatedCounselors);

// Most experienced counselors
router.get('/most-experienced', validateQuery(topCounselorsQuerySchema), counselorController.getMostExperiencedCounselors);

// All specialties
router.get('/specialties', counselorController.getAllSpecialties);

// Get counselor statistics - admin only
router.get(
  '/stats/overview',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  counselorController.getCounselorStats
);

// ============= Public routes (general) =============
// Get all counselors (public can only see active counselors)
router.get('/', validateQuery(counselorPaginationSchema), counselorController.getAllCounselors);

// Get counselor by ID (public)
router.get('/:id', validateParams(counselorIdParamSchema), counselorController.getCounselorById);

// ============= Admin routes (create, update, delete) =============
// Create counselor
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  uploadSingle('avatar'),
  validate(createCounselorSchema),
  counselorController.createCounselor
);

// Update counselor
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateParams(counselorIdParamSchema),
  uploadSingle('avatar'),
  validate(updateCounselorSchema),
  counselorController.updateCounselor
);

// Update counselor rating
router.patch(
  '/:id/rating',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateParams(counselorIdParamSchema),
  validate(updateCounselorRatingSchema),
  counselorController.updateCounselorRating
);

// Delete counselor (hard delete)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateParams(counselorIdParamSchema),
  counselorController.deleteCounselor
);

// Soft delete counselor (deactivate)
router.post(
  '/:id/deactivate',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateParams(counselorIdParamSchema),
  counselorController.softDeleteCounselor
);

export default router;
