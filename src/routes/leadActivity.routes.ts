import { Router } from 'express';
import leadActivityController from '../controllers/leadActivity.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate, validateQuery, validateParams } from '../middlewares/validate';
import {
  createLeadActivitySchema,
  updateLeadActivitySchema,
  getActivitiesQuerySchema,
  leadIdParamSchema,
  leadActivityParamsSchema,
} from '../validators/leadActivity.validator';

const router = Router();

/**
 * Admin routes for viewing all recent activities
 */
router.get(
  '/activities/recent',
  authenticate,
  authorize('ADMIN'),
  leadActivityController.getRecentActivities
);

/**
 * Counselor routes for viewing their own activities
 */
router.get(
  '/my-activities',
  authenticate,
  validateQuery(getActivitiesQuerySchema),
  leadActivityController.getMyCounselorActivities
);

/**
 * Lead activity routes (nested under leads)
 */

// Get activity statistics for a lead (Admin only)
router.get(
  '/leads/:leadId/activities/stats',
  authenticate,
  authorize('ADMIN'),
  validateParams(leadIdParamSchema),
  leadActivityController.getLeadActivityStats
);

// Get all activities for a lead (Admin only)
router.get(
  '/leads/:leadId/activities',
  authenticate,
  authorize('ADMIN'),
  validateParams(leadIdParamSchema),
  validateQuery(getActivitiesQuerySchema),
  leadActivityController.getLeadActivities
);

// Create activity for a lead (Admin only)
router.post(
  '/leads/:leadId/activities',
  authenticate,
  authorize('ADMIN'),
  validateParams(leadIdParamSchema),
  validate(createLeadActivitySchema),
  leadActivityController.createActivity
);

// Get single activity by ID (Admin only)
router.get(
  '/leads/:leadId/activities/:activityId',
  authenticate,
  authorize('ADMIN'),
  validateParams(leadActivityParamsSchema),
  leadActivityController.getActivityById
);

// Update activity (Admin only)
router.patch(
  '/leads/:leadId/activities/:activityId',
  authenticate,
  authorize('ADMIN'),
  validateParams(leadActivityParamsSchema),
  validate(updateLeadActivitySchema),
  leadActivityController.updateActivity
);

// Delete activity (Admin only)
router.delete(
  '/leads/:leadId/activities/:activityId',
  authenticate,
  authorize('ADMIN'),
  validateParams(leadActivityParamsSchema),
  leadActivityController.deleteActivity
);

export default router;
