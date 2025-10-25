import { Request, Response } from 'express';
import summaryService from '../services/summary.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';

class SummaryController {
  /**
   * Get dashboard summary
   * @route GET /api/v1/summary/dashboard
   * @access Private (Admin only)
   */
  getDashboardSummary = asyncHandler(async (_req: Request, res: Response) => {
    const summary = await summaryService.getDashboardSummary();

    return ApiResponse.success(
      res,
      summary,
      'Dashboard summary retrieved successfully'
    );
  });
}

export default new SummaryController();
