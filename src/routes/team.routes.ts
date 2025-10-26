import { Router } from 'express';
import teamController from '../controllers/team.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate, validateQuery, validateParams } from '../middlewares/validate';
import { uploadSingle } from '../middlewares/upload';
import {
  createTeamSchema,
  updateTeamSchema,
  getTeamMembersQuerySchema,
  teamIdParamSchema,
} from '../validators/team.validator';

const router = Router();

/**
 * Public routes
 */

// Get all team members with filters (single endpoint with query params)
router.get(
  '/',
  validateQuery(getTeamMembersQuerySchema),
  teamController.getTeamMembers
);

// Get team member by ID
router.get(
  '/:id',
  validateParams(teamIdParamSchema),
  teamController.getTeamMemberById
);

/**
 * Admin only routes
 */

// Create team member
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  uploadSingle('image'),
  validate(createTeamSchema),
  teamController.createTeamMember
);

// Get statistics
router.get(
  '/stats/overview',
  authenticate,
  authorize('ADMIN'),
  teamController.getTeamStats
);

// Update team member
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(teamIdParamSchema),
  uploadSingle('image'),
  validate(updateTeamSchema),
  teamController.updateTeamMember
);

// Publish team member
router.post(
  '/:id/publish',
  authenticate,
  authorize('ADMIN'),
  validateParams(teamIdParamSchema),
  teamController.publishTeamMember
);

// Unpublish team member
router.post(
  '/:id/unpublish',
  authenticate,
  authorize('ADMIN'),
  validateParams(teamIdParamSchema),
  teamController.unpublishTeamMember
);

// Deactivate team member
router.post(
  '/:id/deactivate',
  authenticate,
  authorize('ADMIN'),
  validateParams(teamIdParamSchema),
  teamController.deactivateTeamMember
);

// Delete team member
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(teamIdParamSchema),
  teamController.deleteTeamMember
);

export default router;
