import { Router } from 'express';
import testimonialController from '../controllers/testimonial.controller';
import { authenticate, authorize } from '../middlewares/auth';
import { validate, validateQuery, validateParams } from '../middlewares/validate';
import { uploadSingle } from '../middlewares/upload';
import {
  createTestimonialSchema,
  updateTestimonialSchema,
  getTestimonialsQuerySchema,
  testimonialIdParamSchema,
  ratingParamSchema,
  locationQuerySchema,
  searchQuerySchema,
} from '../validators/testimonial.validator';

const router = Router();

/**
 * Public routes
 */

// Get published testimonials (public view)
router.get(
  '/published',
  validateQuery(getTestimonialsQuerySchema),
  testimonialController.getPublishedTestimonials
);

// Get favorite testimonials
router.get(
  '/favorites',
  validateQuery(getTestimonialsQuerySchema),
  testimonialController.getFavoriteTestimonials
);

// Search testimonials
router.get(
  '/search',
  validateQuery(searchQuerySchema),
  testimonialController.searchTestimonials
);

// Get testimonials by location
router.get(
  '/location',
  validateQuery(locationQuerySchema),
  testimonialController.getTestimonialsByLocation
);

// Get testimonials by rating
router.get(
  '/rating/:rating',
  validateParams(ratingParamSchema),
  validateQuery(getTestimonialsQuerySchema),
  testimonialController.getTestimonialsByRating
);

// Get all testimonials with filters
router.get(
  '/',
  validateQuery(getTestimonialsQuerySchema),
  testimonialController.getAllTestimonials
);

// Get testimonial by ID
router.get(
  '/:id',
  validateParams(testimonialIdParamSchema),
  testimonialController.getTestimonialById
);

// Create testimonial (Public - anyone can create)
router.post(
  '/',
  uploadSingle('profileImage'),
  validate(createTestimonialSchema),
  testimonialController.createTestimonial
);

/**
 * Protected routes (Authenticated users)
 */

// Get current user's testimonials
router.get(
  '/my/testimonials',
  authenticate,
  testimonialController.getMyTestimonials
);

// Update testimonial (owner or admin)
router.patch(
  '/:id',
  authenticate,
  uploadSingle('profileImage'),
  validateParams(testimonialIdParamSchema),
  validate(updateTestimonialSchema),
  testimonialController.updateTestimonial
);

// Delete testimonial (owner or admin)
router.delete(
  '/:id',
  authenticate,
  validateParams(testimonialIdParamSchema),
  testimonialController.deleteTestimonial
);

// Deactivate testimonial (owner or admin)
router.post(
  '/:id/deactivate',
  authenticate,
  validateParams(testimonialIdParamSchema),
  testimonialController.deactivateTestimonial
);

/**
 * Admin only routes
 */

// Get testimonial statistics
router.get(
  '/stats/overview',
  authenticate,
  authorize('ADMIN'),
  testimonialController.getTestimonialStats
);

// Toggle favorite status
router.patch(
  '/:id/favorite',
  authenticate,
  authorize('ADMIN'),
  validateParams(testimonialIdParamSchema),
  testimonialController.toggleFavorite
);

// Publish testimonial
router.patch(
  '/:id/publish',
  authenticate,
  authorize('ADMIN'),
  validateParams(testimonialIdParamSchema),
  testimonialController.publishTestimonial
);

// Unpublish testimonial
router.patch(
  '/:id/unpublish',
  authenticate,
  authorize('ADMIN'),
  validateParams(testimonialIdParamSchema),
  testimonialController.unpublishTestimonial
);

export default router;
