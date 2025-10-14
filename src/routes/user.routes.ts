import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate, authorize, requireVerification } from '../middlewares/auth';
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

// Profile management (verification NOT required for viewing profile)
router.get('/profile', authenticate, userController.getProfile);

// Profile management (verification REQUIRED for updates)
router.patch('/profile', authenticate, requireVerification, validate(updateProfileSchema), userController.updateProfile);
router.put('/profile/upload', authenticate, requireVerification, uploadSingle('profilePicture'), userController.updateProfileWithImage);
router.post('/change-password', authenticate, requireVerification, validate(changePasswordSchema), userController.changePassword);

// Verification (no verification required - users need these to verify themselves)
router.post('/verify-email', authenticate, validate(verifyEmailSchema), userController.verifyEmail);
router.post('/resend-otp', authenticate, userController.resendOTP);
router.post('/verify-phone', authenticate, userController.verifyPhone);

// ============= Admin routes (require authentication, verification, and admin role) =============
// User management
router.get(
  '/',
  authenticate,
  requireVerification,
  authorize('ADMIN'),
  validateQuery(paginationSchema),
  userController.getAllUsers
);

router.get(
  '/:id',
  authenticate,
  requireVerification,
  authorize('ADMIN'),
  validateParams(idParamSchema),
  userController.getUserById
);

router.patch(
  '/:id',
  authenticate,
  requireVerification,
  authorize('ADMIN'),
  validateParams(idParamSchema),
  validate(updateUserSchema),
  userController.updateUser
);

router.delete(
  '/:id',
  authenticate,
  requireVerification,
  authorize('ADMIN'),
  validateParams(idParamSchema),
  userController.deleteUser
);

router.post(
  '/:id/deactivate',
  authenticate,
  requireVerification,
  authorize('ADMIN'),
  validateParams(idParamSchema),
  userController.softDeleteUser
);

export default router;
