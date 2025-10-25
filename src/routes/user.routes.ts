import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate, authorize, requireVerification, optionalAuthenticate } from '../middlewares/auth';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import { uploadSingle } from '../middlewares/upload';
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  updateProfileSchema,
  changePasswordSchema,
  verifyEmailSchema,
  resendOTPSchema,
  paginationSchema,
  idParamSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/user.validator';

const router = Router();

// ============= Public routes =============
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);

// Password reset (PUBLIC)
router.post('/forgot-password', validate(forgotPasswordSchema), userController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), userController.resetPassword);

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

// Verification (PUBLIC - users need these to verify themselves, can be called with or without authentication)
// If authenticated (has token): email is optional in body
// If not authenticated (no token): email is required in body
router.post('/verify-email', optionalAuthenticate, validate(verifyEmailSchema), userController.verifyEmail);
router.post('/resend-otp', optionalAuthenticate, validate(resendOTPSchema), userController.resendOTP);
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
