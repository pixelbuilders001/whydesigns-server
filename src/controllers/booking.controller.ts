import { Request, Response, NextFunction } from 'express';
import bookingService from '../services/booking.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { PaginationOptions } from '../types';

export class BookingController {
  // Create a new booking (public - for both logged-in and guest users)
  createBooking = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id; // Optional - will be undefined for guests

    const bookingData = {
      ...req.body,
      userId,
    };

    const booking = await bookingService.createBooking(bookingData);

    return ApiResponse.created(
      res,
      booking,
      'Booking created successfully. A confirmation email has been sent.'
    );
  });

  // Get booking by ID
  getBookingById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id);

    return ApiResponse.success(res, booking, 'Booking retrieved successfully');
  });

  // Get all bookings (Admin only)
  getAllBookings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const options: PaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: (req.query.sortBy as string) || 'bookingDate',
      order: (req.query.order as 'asc' | 'desc') || 'asc',
    };

    const result = await bookingService.getAllBookings(options);

    return ApiResponse.paginated(
      res,
      result.bookings,
      result.page,
      options.limit,
      result.total,
      'Bookings retrieved successfully'
    );
  });

  // Get bookings by status (Admin only)
  getBookingsByStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.query;

    const options: PaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: (req.query.sortBy as string) || 'bookingDate',
      order: (req.query.order as 'asc' | 'desc') || 'asc',
    };

    const result = await bookingService.getBookingsByStatus(status as any, options);

    return ApiResponse.paginated(
      res,
      result.bookings,
      result.page,
      options.limit,
      result.total,
      `${status} bookings retrieved successfully`
    );
  });

  // Get bookings by counselor (Admin only)
  getBookingsByCounselor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { counselorId } = req.params;

    const options: PaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: (req.query.sortBy as string) || 'bookingDate',
      order: (req.query.order as 'asc' | 'desc') || 'asc',
    };

    const result = await bookingService.getBookingsByCounselor(counselorId, options);

    return ApiResponse.paginated(
      res,
      result.bookings,
      result.page,
      options.limit,
      result.total,
      'Counselor bookings retrieved successfully'
    );
  });

  // Get bookings by user (User or Admin)
  getBookingsByUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    // Users can only view their own bookings unless they're admin
    if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
      throw new AppError('You can only view your own bookings', 403);
    }

    const options: PaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: (req.query.sortBy as string) || 'bookingDate',
      order: (req.query.order as 'asc' | 'desc') || 'asc',
    };

    const result = await bookingService.getBookingsByUser(userId, options);

    return ApiResponse.paginated(
      res,
      result.bookings,
      result.page,
      options.limit,
      result.total,
      'User bookings retrieved successfully'
    );
  });

  // Get bookings by email (Public - for guest users to check their bookings)
  getBookingsByEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.query;

    const options: PaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: (req.query.sortBy as string) || 'bookingDate',
      order: (req.query.order as 'asc' | 'desc') || 'asc',
    };

    const result = await bookingService.getBookingsByEmail(email as string, options);

    return ApiResponse.paginated(
      res,
      result.bookings,
      result.page,
      options.limit,
      result.total,
      'Bookings retrieved successfully'
    );
  });

  // Get upcoming bookings (Admin only)
  getUpcomingBookings = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const bookings = await bookingService.getUpcomingBookings(limit);

    return ApiResponse.success(res, bookings, 'Upcoming bookings retrieved successfully');
  });

  // Get upcoming bookings by user
  getUpcomingBookingsByUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    // Users can only view their own bookings unless they're admin
    if (req.user?.role !== 'ADMIN' && req.user?.id !== userId) {
      throw new AppError('You can only view your own bookings', 403);
    }

    const bookings = await bookingService.getUpcomingBookingsByUser(userId);

    return ApiResponse.success(res, bookings, 'Upcoming bookings retrieved successfully');
  });

  // Get upcoming bookings by email (Public)
  getUpcomingBookingsByEmail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.query;
    const bookings = await bookingService.getUpcomingBookingsByEmail(email as string);

    return ApiResponse.success(res, bookings, 'Upcoming bookings retrieved successfully');
  });

  // Get upcoming bookings by counselor (Admin only)
  getUpcomingBookingsByCounselor = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { counselorId } = req.params;
    const bookings = await bookingService.getUpcomingBookingsByCounselor(counselorId);

    return ApiResponse.success(res, bookings, 'Upcoming counselor bookings retrieved successfully');
  });

  // Get counselor bookings for specific date (Admin only)
  getCounselorBookingsForDate = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { counselorId } = req.params;
    const { date } = req.query;

    const bookings = await bookingService.getCounselorBookingsForDate(
      counselorId,
      new Date(date as string)
    );

    return ApiResponse.success(res, bookings, 'Counselor bookings for date retrieved successfully');
  });

  // Update booking (Admin only)
  updateBooking = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const booking = await bookingService.updateBooking(id, req.body);

    return ApiResponse.success(res, booking, 'Booking updated successfully');
  });

  // Confirm booking (Admin only)
  confirmBooking = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const booking = await bookingService.confirmBooking(id);

    return ApiResponse.success(res, booking, 'Booking confirmed successfully');
  });

  // Cancel booking (Admin only)
  cancelBooking = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const booking = await bookingService.cancelBooking(id, req.body);

    return ApiResponse.success(res, booking, 'Booking cancelled successfully');
  });

  // Complete booking (Admin only)
  completeBooking = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const booking = await bookingService.completeBooking(id);

    return ApiResponse.success(res, booking, 'Booking marked as completed');
  });

  // Mark booking as no-show (Admin only)
  markNoShow = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const booking = await bookingService.markNoShow(id);

    return ApiResponse.success(res, booking, 'Booking marked as no-show');
  });

  // Delete booking (Admin only)
  deleteBooking = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    await bookingService.deleteBooking(id);

    return ApiResponse.success(res, null, 'Booking deleted successfully');
  });

  // Get booking statistics (Admin only)
  getBookingStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await bookingService.getBookingStats();

    return ApiResponse.success(res, stats, 'Booking statistics retrieved successfully');
  });

  // Send reminders (Admin only - typically called by a cron job)
  sendReminders = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    await bookingService.sendReminders();

    return ApiResponse.success(res, null, 'Booking reminders sent successfully');
  });
}

export default new BookingController();
