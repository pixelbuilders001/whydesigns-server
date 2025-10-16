import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AuthenticatedRequest, PaginationQuery } from '../types';

export class UserController {
  register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userData = req.body;

    const result = await userService.register(userData);

    return ApiResponse.created(
      res,
      {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      },
      'User registered successfully'
    );
  });

  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const result = await userService.login(email, password);

    return ApiResponse.success(
      res,
      {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      },
      'Login successful'
    );
  });

  refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    const result = await userService.refreshToken(refreshToken);

    return ApiResponse.success(res, result, 'Token refreshed successfully');
  });

  logout = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    await userService.logout(userId);

    return ApiResponse.success(res, null, 'Logout successful');
  });

  getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    const user = await userService.getUserById(userId);

    return ApiResponse.success(res, user, 'User profile retrieved successfully');
  });

  updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    const user = await userService.updateProfile(userId, req.body);

    return ApiResponse.success(res, user, 'Profile updated successfully');
  });

  updateProfileWithImage = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    const file = req.file;
    const updateData = req.body;

    const user = await userService.updateProfileWithImage(userId, updateData, file);

    return ApiResponse.success(res, user, 'Profile updated successfully');
  });

  changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    const { currentPassword, newPassword } = req.body;

    await userService.changePassword(userId, currentPassword, newPassword);

    return ApiResponse.success(res, null, 'Password changed successfully');
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    await userService.forgotPassword(email);

    return ApiResponse.success(
      res,
      null,
      'If the email exists in our system, a password reset OTP has been sent. Please check your email.'
    );
  });

  resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp, newPassword } = req.body;

    await userService.resetPassword(email, otp, newPassword);

    return ApiResponse.success(res, null, 'Password reset successfully. Please log in with your new password.');
  });

  verifyEmail = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id; // Optional - may be undefined for public access
    const { otp, email } = req.body;

    // Support both authenticated and public requests
    const user = await userService.verifyEmail(otp, userId, email);

    return ApiResponse.success(res, user, 'Email verified successfully');
  });

  resendOTP = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id; // Optional - may be undefined for public access
    const { email } = req.body;

    // Support both authenticated and public requests
    await userService.resendOTP(userId, email);

    return ApiResponse.success(res, null, 'OTP has been sent to your email');
  });

  verifyPhone = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;

    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized', 401);
    }

    const user = await userService.verifyPhone(userId);

    return ApiResponse.success(res, user, 'Phone verified successfully');
  });

  getUserById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    return ApiResponse.success(res, user, 'User retrieved successfully');
  });

  getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as unknown as PaginationQuery;
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';

    const { users, total } = await userService.getAllUsers({
      page,
      limit,
      sortBy,
      order,
    });

    return ApiResponse.paginated(res, users, page, limit, total, 'Users retrieved successfully');
  });

  updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body;

    const user = await userService.updateUser(id, updateData);

    return ApiResponse.success(res, user, 'User updated successfully');
  });

  deleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    await userService.deleteUser(id);

    return ApiResponse.success(res, null, 'User deleted successfully');
  });

  softDeleteUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await userService.softDeleteUser(id);

    return ApiResponse.success(res, user, 'User deactivated successfully');
  });
}

export default new UserController();
