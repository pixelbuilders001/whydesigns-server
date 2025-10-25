import { Request, Response, NextFunction } from 'express';
import counselorService from '../services/counselor.service';
import s3Service from '../services/s3.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { PaginationQuery } from '../types';

export class CounselorController {
  createCounselor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Handle file upload if present
    let avatarUrl = '';
    if (req.file) {
      avatarUrl = await s3Service.uploadFile(req.file, 'counselor-avatars');
    }

    // Parse specialties if it's a string (from form data)
    let specialties = req.body.specialties;
    if (typeof specialties === 'string') {
      try {
        specialties = JSON.parse(specialties);
      } catch (e) {
        // If not JSON, treat as comma-separated string
        specialties = specialties.split(',').map((s: string) => s.trim());
      }
    }

    const counselorData = {
      ...req.body,
      specialties,
      avatarUrl: avatarUrl || req.body.avatarUrl || '',
    };

    const counselor = await counselorService.createCounselor(counselorData);

    return ApiResponse.created(res, counselor, 'Counselor created successfully');
  });

  getAllCounselors = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as PaginationQuery & { search?: string; specialty?: string; isActive?: string };
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';
    const search = query.search;
    const specialty = query.specialty;

    const filters: any = {};
    if (query.isActive !== undefined) filters.isActive = query.isActive === 'true';

    let result;
    if (search && search.trim() !== '') {
      result = await counselorService.searchCounselors(search, { page, limit, sortBy, order });
    } else if (specialty && specialty.trim() !== '') {
      result = await counselorService.getCounselorsBySpecialty(specialty, { page, limit, sortBy, order });
    } else {
      result = await counselorService.getAllCounselors({ page, limit, sortBy, order }, filters);
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
    const id = req.params.id;
    const counselor = await counselorService.getCounselorById(id);
    return ApiResponse.success(res, counselor, 'Counselor retrieved successfully');
  });

  updateCounselor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;

    // Handle file upload if present
    let avatarUrl = '';
    if (req.file) {
      avatarUrl = await s3Service.uploadFile(req.file, 'counselor-avatars');

      // Get existing counselor to delete old avatar
      const existingCounselor = await counselorService.getCounselorById(id);
      if (existingCounselor.avatarUrl) {
        await s3Service.deleteFile(existingCounselor.avatarUrl);
      }
    }

    // Parse specialties if it's a string (from form data)
    let specialties = req.body.specialties;
    if (typeof specialties === 'string') {
      try {
        specialties = JSON.parse(specialties);
      } catch (e) {
        // If not JSON, treat as comma-separated string
        specialties = specialties.split(',').map((s: string) => s.trim());
      }
    }

    const updateData = {
      ...req.body,
      ...(specialties && { specialties }),
      ...(avatarUrl && { avatarUrl }),
    };

    const counselor = await counselorService.updateCounselor(id, updateData);

    return ApiResponse.success(res, counselor, 'Counselor updated successfully');
  });

  deleteCounselor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    await counselorService.deleteCounselor(id);
    return ApiResponse.success(res, null, 'Counselor deleted successfully');
  });

  softDeleteCounselor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
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
    const id = req.params.id;
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
