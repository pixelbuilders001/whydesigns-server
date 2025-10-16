import { Router } from 'express';
import bookingController from '../controllers/booking.controller';
import { authenticate, authorize, requireVerification } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/validate';
import {
  createBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  bookingPaginationSchema,
  statusQuerySchema,
  emailQuerySchema,
  dateQuerySchema,
  upcomingLimitSchema,
} from '../validators/booking.validator';

const router = Router();

/**
 * @route   POST /api/v1/bookings
 * @desc    Create a new booking (Public - for both logged-in and guest users)
 * @access  Public (optionally authenticated)
 */
router.post('/', validate(createBookingSchema), bookingController.createBooking);

/**
 * @route   GET /api/v1/bookings
 * @desc    Get all bookings with pagination
 * @access  Admin
 */
router.get(
  '/',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateQuery(bookingPaginationSchema),
  bookingController.getAllBookings
);

/**
 * @route   GET /api/v1/bookings/status
 * @desc    Get bookings by status
 * @access  Admin
 */
router.get(
  '/status',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateQuery(statusQuerySchema),
  bookingController.getBookingsByStatus
);

/**
 * @route   GET /api/v1/bookings/email
 * @desc    Get bookings by email (for guest users)
 * @access  Public
 */
router.get('/email', validateQuery(emailQuerySchema), bookingController.getBookingsByEmail);

/**
 * @route   GET /api/v1/bookings/upcoming
 * @desc    Get upcoming bookings
 * @access  Admin
 */
router.get(
  '/upcoming',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateQuery(upcomingLimitSchema),
  bookingController.getUpcomingBookings
);

/**
 * @route   GET /api/v1/bookings/upcoming/email
 * @desc    Get upcoming bookings by email
 * @access  Public
 */
router.get(
  '/upcoming/email',
  validateQuery(emailQuerySchema),
  bookingController.getUpcomingBookingsByEmail
);

/**
 * @route   GET /api/v1/bookings/stats
 * @desc    Get booking statistics
 * @access  Admin
 */
router.get(
  '/stats',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  bookingController.getBookingStats
);

/**
 * @route   POST /api/v1/bookings/send-reminders
 * @desc    Send reminder emails for upcoming bookings (typically called by cron job)
 * @access  Admin
 */
router.post(
  '/send-reminders',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  bookingController.sendReminders
);

/**
 * @route   GET /api/v1/bookings/counselor/:counselorId
 * @desc    Get bookings by counselor
 * @access  Admin
 */
router.get(
  '/counselor/:counselorId',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateQuery(bookingPaginationSchema),
  bookingController.getBookingsByCounselor
);

/**
 * @route   GET /api/v1/bookings/counselor/:counselorId/upcoming
 * @desc    Get upcoming bookings by counselor
 * @access  Admin
 */
router.get(
  '/counselor/:counselorId/upcoming',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  bookingController.getUpcomingBookingsByCounselor
);

/**
 * @route   GET /api/v1/bookings/counselor/:counselorId/date
 * @desc    Get counselor bookings for specific date
 * @access  Admin
 */
router.get(
  '/counselor/:counselorId/date',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validateQuery(dateQuerySchema),
  bookingController.getCounselorBookingsForDate
);

/**
 * @route   GET /api/v1/bookings/user/:userId
 * @desc    Get bookings by user
 * @access  User (own bookings) or Admin
 */
router.get(
  '/user/:userId',
  authenticate,
  requireVerification,
  validateQuery(bookingPaginationSchema),
  bookingController.getBookingsByUser
);

/**
 * @route   GET /api/v1/bookings/user/:userId/upcoming
 * @desc    Get upcoming bookings by user
 * @access  User (own bookings) or Admin
 */
router.get(
  '/user/:userId/upcoming',
  authenticate,
  requireVerification,
  bookingController.getUpcomingBookingsByUser
);

/**
 * @route   GET /api/v1/bookings/:id
 * @desc    Get booking by ID
 * @access  Public (anyone with the ID can view)
 */
router.get('/:id', bookingController.getBookingById);

/**
 * @route   PATCH /api/v1/bookings/:id
 * @desc    Update booking
 * @access  Admin
 */
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validate(updateBookingSchema),
  bookingController.updateBooking
);

/**
 * @route   PATCH /api/v1/bookings/:id/confirm
 * @desc    Confirm a booking
 * @access  Admin
 */
router.patch(
  '/:id/confirm',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  bookingController.confirmBooking
);

/**
 * @route   PATCH /api/v1/bookings/:id/cancel
 * @desc    Cancel a booking
 * @access  Admin
 */
router.patch(
  '/:id/cancel',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  validate(cancelBookingSchema),
  bookingController.cancelBooking
);

/**
 * @route   PATCH /api/v1/bookings/:id/complete
 * @desc    Mark booking as completed
 * @access  Admin
 */
router.patch(
  '/:id/complete',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  bookingController.completeBooking
);

/**
 * @route   PATCH /api/v1/bookings/:id/no-show
 * @desc    Mark booking as no-show
 * @access  Admin
 */
router.patch(
  '/:id/no-show',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  bookingController.markNoShow
);

/**
 * @route   DELETE /api/v1/bookings/:id
 * @desc    Delete a booking
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  requireVerification,
  bookingController.deleteBooking
);

export default router;
