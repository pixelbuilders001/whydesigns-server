import { Router } from 'express';
import leadController from '../controllers/lead.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate, validateQuery, validateParams } from '../middlewares/validate';
import {
  createLeadSchema,
  updateLeadSchema,
  updateActiveStatusSchema,
  getLeadsQuerySchema,
  leadIdParamSchema,
} from '../validators/lead.validator';

const router = Router();

/**
 * Public routes
 */

// Create lead (Public - for lead generation forms)
router.post(
  '/',
  validate(createLeadSchema),
  leadController.createLead
);

/**
 * Admin only routes
 */

// Get lead statistics (must be before /:id to avoid route conflict)
router.get(
  '/stats/overview',
  authenticate,
  authorize('ADMIN'),
  leadController.getLeadStats
);

// Get all leads with filters
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  validateQuery(getLeadsQuerySchema),
  leadController.getAllLeads
);

// Get lead by ID
router.get(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(leadIdParamSchema),
  leadController.getLeadById
);

// Update lead
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(leadIdParamSchema),
  validate(updateLeadSchema),
  leadController.updateLead
);

// Delete lead
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(leadIdParamSchema),
  leadController.deleteLead
);

// Update isActive status
router.patch(
  '/:id/status',
  authenticate,
  authorize('ADMIN'),
  validateParams(leadIdParamSchema),
  validate(updateActiveStatusSchema),
  leadController.updateActiveStatus
);

export default router;
