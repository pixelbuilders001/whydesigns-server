import { Router } from 'express';
import summaryController from '../controllers/summary.controller';
import { authenticate, authorize } from '../middlewares/auth';

const router = Router();

/**
 * Admin only routes
 */

// Get dashboard summary
router.get(
  '/dashboard',
  authenticate,
  authorize('ADMIN'),
  summaryController.getDashboardSummary
);

export default router;
