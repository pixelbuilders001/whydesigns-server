import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import teamService from '../services/team.service';
import s3Service from '../services/s3.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { AppError } from '../utils/AppError';

class TeamController {
  /**
   * Create a new team member
   * @route POST /api/v1/team
   * @access Private (Admin only)
   */
  createTeamMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // Handle file upload
    const file = req.file;

    if (!file) {
      throw new AppError('Image is required', 400);
    }

    // Upload image to S3
    const imageUrl = await s3Service.uploadFile(file, 'team');

    // Create team member data
    const teamData = {
      name: req.body.name,
      designation: req.body.designation,
      description: req.body.description,
      image: imageUrl,
      isPublished: req.body.isPublished === 'true',
      displayOrder: req.body.displayOrder ? parseInt(req.body.displayOrder) : undefined,
    };

    const team = await teamService.createTeamMember(teamData);

    return ApiResponse.success(
      res,
      team,
      'Team member created successfully',
      201
    );
  });

  /**
   * Get team members with filters
   * @route GET /api/v1/team
   * @access Public (use query params to filter)
   */
  getTeamMembers = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, sortBy, sortOrder, isPublished, isActive, search } = req.query;

    const filters: any = {};

    // Apply filters based on query params
    if (isPublished !== undefined) {
      filters.isPublished = isPublished === 'true';
    }

    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    if (search) {
      filters.search = String(search);
    }

    const options = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy: sortBy ? String(sortBy) : 'displayOrder',
      sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
    };

    const result = await teamService.getAllTeamMembers(filters, options);

    return ApiResponse.success(
      res,
      result,
      'Team members retrieved successfully'
    );
  });

  /**
   * Get team member by ID
   * @route GET /api/v1/team/:id
   * @access Public
   */
  getTeamMemberById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const team = await teamService.getTeamMemberById(id);

    return ApiResponse.success(
      res,
      team,
      'Team member retrieved successfully'
    );
  });

  /**
   * Update team member
   * @route PATCH /api/v1/team/:id
   * @access Private (Admin only)
   */
  updateTeamMember = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Get existing team member
    const existingTeam = await teamService.getTeamMemberById(id);

    // Handle file upload if present
    const file = req.file;
    let imageUrl = existingTeam.image;

    if (file) {
      // Upload new image to S3
      imageUrl = await s3Service.uploadFile(file, 'team');

      // Delete old image from S3
      if (existingTeam.image) {
        await s3Service.deleteFile(existingTeam.image);
      }
    }

    // Build update data
    const updateData: any = {
      ...req.body,
      image: imageUrl,
    };

    // Parse numeric fields if they're strings
    if (updateData.displayOrder) {
      updateData.displayOrder = parseInt(updateData.displayOrder);
    }
    if (updateData.isPublished === 'true') {
      updateData.isPublished = true;
    } else if (updateData.isPublished === 'false') {
      updateData.isPublished = false;
    }

    const team = await teamService.updateTeamMember(id, updateData);

    return ApiResponse.success(
      res,
      team,
      'Team member updated successfully'
    );
  });

  /**
   * Delete team member
   * @route DELETE /api/v1/team/:id
   * @access Private (Admin only)
   */
  deleteTeamMember = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    // Get team member to delete image from S3
    const team = await teamService.getTeamMemberById(id);

    // Delete image from S3
    if (team.image) {
      await s3Service.deleteFile(team.image);
    }

    await teamService.deleteTeamMember(id);

    return ApiResponse.success(
      res,
      null,
      'Team member deleted successfully'
    );
  });

  /**
   * Deactivate team member (soft delete)
   * @route POST /api/v1/team/:id/deactivate
   * @access Private (Admin only)
   */
  deactivateTeamMember = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const team = await teamService.deactivateTeamMember(id);

    return ApiResponse.success(
      res,
      team,
      'Team member deactivated successfully'
    );
  });

  /**
   * Publish team member
   * @route POST /api/v1/team/:id/publish
   * @access Private (Admin only)
   */
  publishTeamMember = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const team = await teamService.publishTeamMember(id);

    return ApiResponse.success(
      res,
      team,
      'Team member published successfully'
    );
  });

  /**
   * Unpublish team member
   * @route POST /api/v1/team/:id/unpublish
   * @access Private (Admin only)
   */
  unpublishTeamMember = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const team = await teamService.unpublishTeamMember(id);

    return ApiResponse.success(
      res,
      team,
      'Team member unpublished successfully'
    );
  });

  /**
   * Get team statistics
   * @route GET /api/v1/team/stats/overview
   * @access Private (Admin only)
   */
  getTeamStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await teamService.getTeamStats();

    return ApiResponse.success(
      res,
      stats,
      'Team statistics retrieved successfully'
    );
  });
}

export default new TeamController();
