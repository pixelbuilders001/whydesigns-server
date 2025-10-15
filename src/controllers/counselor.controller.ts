import { Request, Response, NextFunction } from 'express';
import counselorService from '../services/counselor.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { PaginationQuery } from '../types';

export class CounselorController {
  createCounselor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const counselorData = req.body;

    const counselor = await counselorService.createCounselor(counselorData);

    return ApiResponse.created(res, counselor, 'Counselor created successfully');
  });

  getAllCounselors = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as PaginationQuery & { search?: string; specialty?: string; includeInactive?: string };
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';
    const search = query.search;
    const specialty = query.specialty;
    const includeInactive = query.includeInactive === 'true';

    let result;
    if (search && search.trim() !== '') {
      result = await counselorService.searchCounselors(search, { page, limit, sortBy, order });
    } else if (specialty && specialty.trim() !== '') {
      result = await counselorService.getCounselorsBySpecialty(specialty, { page, limit, sortBy, order });
    } else {
      result = await counselorService.getAllCounselors({ page, limit, sortBy, order }, includeInactive);
    }

    return ApiResponse.paginated(
      res,
      result.counselors,
      page,
      limit,
      result.total,
      'Counselors retrieved successfully'
    );
  });

  getCounselorById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return ApiResponse.error(res, 'Invalid counselor ID', 400);
    }

    const counselor = await counselorService.getCounselorById(id);

    return ApiResponse.success(res, counselor, 'Counselor retrieved successfully');
  });

  updateCounselor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return ApiResponse.error(res, 'Invalid counselor ID', 400);
    }

    const updateData = req.body;

    const counselor = await counselorService.updateCounselor(id, updateData);

    return ApiResponse.success(res, counselor, 'Counselor updated successfully');
  });

  deleteCounselor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return ApiResponse.error(res, 'Invalid counselor ID', 400);
    }

    await counselorService.deleteCounselor(id);

    return ApiResponse.success(res, null, 'Counselor deleted successfully');
  });

  softDeleteCounselor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return ApiResponse.error(res, 'Invalid counselor ID', 400);
    }

    const counselor = await counselorService.softDeleteCounselor(id);

    return ApiResponse.success(res, counselor, 'Counselor deactivated successfully');
  });

  getTopRatedCounselors = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string || '10', 10);

    const counselors = await counselorService.getTopRatedCounselors(limit);

    return ApiResponse.success(res, counselors, 'Top rated counselors retrieved successfully');
  });

  getMostExperiencedCounselors = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string || '10', 10);

    const counselors = await counselorService.getMostExperiencedCounselors(limit);

    return ApiResponse.success(res, counselors, 'Most experienced counselors retrieved successfully');
  });

  updateCounselorRating = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return ApiResponse.error(res, 'Invalid counselor ID', 400);
    }

    const { rating } = req.body;

    const counselor = await counselorService.updateCounselorRating(id, rating);

    return ApiResponse.success(res, counselor, 'Counselor rating updated successfully');
  });

  getAllSpecialties = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const specialties = await counselorService.getAllSpecialties();

    return ApiResponse.success(res, specialties, 'Specialties retrieved successfully');
  });

  getCounselorStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await counselorService.getCounselorStats();

    return ApiResponse.success(res, stats, 'Counselor statistics retrieved successfully');
  });
}

export default new CounselorController();
