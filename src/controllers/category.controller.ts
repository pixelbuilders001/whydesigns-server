import { Request, Response, NextFunction } from 'express';
import categoryService from '../services/category.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest, PaginationQuery } from '../types';

export class CategoryController {
  createCategory = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    const categoryData = {
      ...req.body,
      createdBy: userId,
    };

    const category = await categoryService.createCategory(categoryData);

    return ApiResponse.created(res, category, 'Category created successfully');
  });

  getAllCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as PaginationQuery & { search?: string; includeInactive?: string };
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';
    const search = query.search;
    const includeInactive = query.includeInactive === 'true';

    let result;
    if (search && search.trim() !== '') {
      result = await categoryService.searchCategories(search, { page, limit, sortBy, order });
    } else {
      result = await categoryService.getAllCategories({ page, limit, sortBy, order }, includeInactive);
    }

    return ApiResponse.paginated(
      res,
      result.categories,
      page,
      limit,
      result.total,
      'Categories retrieved successfully'
    );
  });

  getCategoryById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const category = await categoryService.getCategoryById(id);

    return ApiResponse.success(res, category, 'Category retrieved successfully');
  });

  getCategoryBySlug = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { slug } = req.params;

    const category = await categoryService.getCategoryBySlug(slug);

    return ApiResponse.success(res, category, 'Category retrieved successfully');
  });

  updateCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    const category = await categoryService.updateCategory(id, updateData);

    return ApiResponse.success(res, category, 'Category updated successfully');
  });

  deleteCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await categoryService.deleteCategory(id);

    return ApiResponse.success(res, null, 'Category deleted successfully');
  });

  softDeleteCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const category = await categoryService.softDeleteCategory(id);

    return ApiResponse.success(res, category, 'Category deactivated successfully');
  });

  getCategoryStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await categoryService.getCategoryStats();

    return ApiResponse.success(res, stats, 'Category statistics retrieved successfully');
  });
}

export default new CategoryController();
