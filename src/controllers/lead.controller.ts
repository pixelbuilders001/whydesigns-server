import { Request, Response } from 'express';
import leadService from '../services/lead.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';

class LeadController {
  /**
   * Create a new lead
   * @route POST /api/v1/leads
   * @access Public
   */
  createLead = asyncHandler(async (req: Request, res: Response) => {
    const lead = await leadService.createLead(req.body);

    return ApiResponse.success(
      res,
      lead,
      'Lead created successfully',
      201
    );
  });

  /**
   * Get all leads (with filters)
   * @route GET /api/v1/leads
   * @access Private (Admin only)
   */
  getAllLeads = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, isActive, areaOfInterest, search } = req.query;

    const filters: any = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (areaOfInterest) filters.areaOfInterest = String(areaOfInterest);
    if (search) filters.search = String(search);

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'createdAt',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await leadService.getAllLeads(filters, options);

    return ApiResponse.success(
      res,
      result,
      'Leads retrieved successfully'
    );
  });

  /**
   * Get lead by ID
   * @route GET /api/v1/leads/:id
   * @access Private (Admin only)
   */
  getLeadById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const lead = await leadService.getLeadById(id);

    return ApiResponse.success(
      res,
      lead,
      'Lead retrieved successfully'
    );
  });

  /**
   * Update lead
   * @route PUT /api/v1/leads/:id
   * @access Private (Admin only)
   */
  updateLead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const lead = await leadService.updateLead(id, req.body);

    return ApiResponse.success(
      res,
      lead,
      'Lead updated successfully'
    );
  });

  /**
   * Delete lead
   * @route DELETE /api/v1/leads/:id
   * @access Private (Admin only)
   */
  deleteLead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await leadService.deleteLead(id);

    return ApiResponse.success(
      res,
      null,
      'Lead deleted successfully'
    );
  });

  /**
   * Update isActive status
   * @route PATCH /api/v1/leads/:id/status
   * @access Private (Admin only)
   */
  updateActiveStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const lead = await leadService.updateActiveStatus(id, isActive);

    return ApiResponse.success(
      res,
      lead,
      `Lead ${isActive ? 'activated' : 'deactivated'} successfully`
    );
  });

  /**
   * Get lead statistics
   * @route GET /api/v1/leads/stats/overview
   * @access Private (Admin only)
   */
  getLeadStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await leadService.getLeadStats();

    return ApiResponse.success(
      res,
      stats,
      'Lead statistics retrieved successfully'
    );
  });
}

export default new LeadController();
