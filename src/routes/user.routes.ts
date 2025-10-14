import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import { uploadSingle } from '../middlewares/upload';
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  verifyEmailSchema,
  verifyPhoneSchema,
  paginationSchema,
  idParamSchema,
} from '../validators/user.validator';

const router = Router();

// ============= Public routes =============
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// ============= Auth routes (require authentication) =============
// Token management
router.post('/refresh-token', userController.refreshToken);
router.post('/logout', authenticate, userController.logout);

// Profile management
router.get('/profile', authenticate, userController.getProfile);
router.patch('/profile', authenticate, validate(updateProfileSchema), userController.updateProfile);
router.put('/profile/upload', authenticate, uploadSingle('profilePicture'), userController.updateProfileWithImage);
router.post('/change-password', authenticate, validate(changePasswordSchema), userController.changePassword);

// Verification
router.post('/verify-email', authenticate, userController.verifyEmail);
router.post('/verify-phone', authenticate, userController.verifyPhone);

// ============= Admin routes (require authentication and admin role) =============
// User management
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  validateQuery(paginationSchema),
  userController.getAllUsers
);

router.get(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(idParamSchema),
  userController.getUserById
);

router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(idParamSchema),
  validate(updateUserSchema),
  userController.updateUser
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validateParams(idParamSchema),
  userController.deleteUser
);

router.post(
  '/:id/deactivate',
  authenticate,
  authorize('ADMIN'),
  validateParams(idParamSchema),
  userController.softDeleteUser
);

export default router;
