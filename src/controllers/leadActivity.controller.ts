import { Request, Response } from 'express';
import leadActivityService from '../services/leadActivity.service';
import { asyncHandler } from '../utils/asyncHandler';

class LeadActivityController {
  /**
   * Create a new lead activity
   * POST /leads/:leadId/activities
   */
  createActivity = asyncHandler(async (req: Request, res: Response) => {
    const { leadId } = req.params;
    const counselorId = (req as any).user.id;
    const activityData = req.body;

    const activity = await leadActivityService.createActivity(
      leadId,
      counselorId,
      activityData
    );

    res.status(201).json({
      success: true,
      message: 'Lead activity created successfully',
      data: activity,
    });
  });

  /**
   * Get all activities for a lead
   * GET /leads/:leadId/activities
   */
  getLeadActivities = asyncHandler(async (req: Request, res: Response) => {
    const { leadId } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    const options = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    const result = await leadActivityService.getLeadActivities(leadId, options);

    res.status(200).json({
      success: true,
      message: 'Lead activities retrieved successfully',
      data: result.activities,
      meta: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    });
  });

  /**
   * Get single activity by ID
   * GET /leads/:leadId/activities/:activityId
   */
  getActivityById = asyncHandler(async (req: Request, res: Response) => {
    const { activityId } = req.params;

    const activity = await leadActivityService.getActivityById(activityId);

    res.status(200).json({
      success: true,
      message: 'Activity retrieved successfully',
      data: activity,
    });
  });

  /**
   * Update lead activity
   * PATCH /leads/:leadId/activities/:activityId
   */
  updateActivity = asyncHandler(async (req: Request, res: Response) => {
    const { activityId } = req.params;
    const counselorId = (req as any).user.id;
    const updateData = req.body;

    const activity = await leadActivityService.updateActivity(
      activityId,
      counselorId,
      updateData
    );

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: activity,
    });
  });

  /**
   * Delete lead activity
   * DELETE /leads/:leadId/activities/:activityId
   */
  deleteActivity = asyncHandler(async (req: Request, res: Response) => {
    const { activityId } = req.params;
    const counselorId = (req as any).user.id;

    await leadActivityService.deleteActivity(activityId, counselorId);

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
    });
  });

  /**
   * Get activity statistics for a lead
   * GET /leads/:leadId/activities/stats
   */
  getLeadActivityStats = asyncHandler(async (req: Request, res: Response) => {
    const { leadId } = req.params;

    const stats = await leadActivityService.getLeadActivityStats(leadId);

    res.status(200).json({
      success: true,
      message: 'Lead activity statistics retrieved successfully',
      data: stats,
    });
  });

  /**
   * Get counselor's activities
   * GET /my-activities
   */
  getMyCounselorActivities = asyncHandler(async (req: Request, res: Response) => {
    const counselorId = (req as any).user.id;
    const { page, limit, sortBy, sortOrder } = req.query;

    const options = {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
    };

    const result = await leadActivityService.getCounselorActivities(counselorId, options);

    res.status(200).json({
      success: true,
      message: 'Your activities retrieved successfully',
      data: result.activities,
      meta: {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      },
    });
  });

  /**
   * Get recent activities (Admin only)
   * GET /activities/recent
   */
  getRecentActivities = asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const limitNum = limit ? parseInt(limit as string) : 10;

    const activities = await leadActivityService.getRecentActivities(limitNum);

    res.status(200).json({
      success: true,
      message: 'Recent activities retrieved successfully',
      data: activities,
    });
  });
}

export default new LeadActivityController();
