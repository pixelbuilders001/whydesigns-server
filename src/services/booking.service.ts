import bookingRepository from '../repositories/booking.repository';
import counselorRepository from '../repositories/counselor.repository';
import bookingEmailService from './bookingEmail.service';
import { IBooking, BookingStatus } from '../models/booking.model';
import { ICounselor } from '../models/counselor.model';
import { PaginationOptions } from '../types';
import { AppError } from '../utils/AppError';

interface CreateBookingInput {
  counselorId: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingDate: Date;
  bookingTime: string;
  duration?: number;
  discussionTopic: string;
}

interface UpdateBookingInput {
  bookingDate?: Date;
  bookingTime?: string;
  duration?: number;
  discussionTopic?: string;
  status?: BookingStatus;
}

interface CancelBookingInput {
  cancellationReason?: string;
  cancelledBy: 'user' | 'admin' | 'counselor';
}

export class BookingService {
  async createBooking(data: CreateBookingInput): Promise<IBooking> {
    // 1. Validate counselor exists and is active
    const counselor = await counselorRepository.findById(data.counselorId);
    if (!counselor) {
      throw new AppError('Counselor not found', 404);
    }
    if (!counselor.isActive) {
      throw new AppError('Counselor is currently not accepting bookings', 400);
    }

    // 2. Check availability
    const isAvailable = await bookingRepository.checkAvailability(
      data.counselorId,
      data.bookingDate,
      data.bookingTime
    );
    if (!isAvailable) {
      throw new AppError('This time slot is not available. Please choose another time.', 400);
    }

    // 3. Validate booking is in the future
    const bookingDateTime = new Date(data.bookingDate);
    const [hours, minutes] = data.bookingTime.split(':');
    bookingDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    if (bookingDateTime <= new Date()) {
      throw new AppError('Booking must be scheduled for a future date and time', 400);
    }

    // 4. Set duration
    const duration = data.duration || 60;

    // 5. Create booking in database
    const booking = await bookingRepository.create({
      ...data,
      duration,
      status: 'pending',
      confirmationEmailSent: false,
      reminderEmailSent: false,
    } as unknown as Partial<IBooking>);

    // 6. Send confirmation email (non-blocking)
    this.sendConfirmationEmail(booking, counselor).catch((error) => {
      console.error('Failed to send confirmation email:', error);
    });

    return booking;
  }

  async getBookingById(id: string): Promise<IBooking> {
    const booking = await bookingRepository.findById(id);
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    return booking;
  }

  async getAllBookings(options: PaginationOptions): Promise<{ bookings: IBooking[]; total: number; page: number; totalPages: number }> {
    const { bookings, total } = await bookingRepository.findAll(options);
    const totalPages = Math.ceil(total / options.limit);

    return {
      bookings,
      total,
      page: options.page,
      totalPages,
    };
  }

  async getBookingsByStatus(
    status: BookingStatus,
    options: PaginationOptions
  ): Promise<{ bookings: IBooking[]; total: number; page: number; totalPages: number }> {
    const { bookings, total } = await bookingRepository.findByStatus(status, options);
    const totalPages = Math.ceil(total / options.limit);

    return {
      bookings,
      total,
      page: options.page,
      totalPages,
    };
  }

  async getBookingsByCounselor(
    counselorId: string,
    options: PaginationOptions
  ): Promise<{ bookings: IBooking[]; total: number; page: number; totalPages: number }> {
    const { bookings, total } = await bookingRepository.findByCounselor(counselorId, options);
    const totalPages = Math.ceil(total / options.limit);

    return {
      bookings,
      total,
      page: options.page,
      totalPages,
    };
  }

  async getBookingsByUser(
    userId: string,
    options: PaginationOptions
  ): Promise<{ bookings: IBooking[]; total: number; page: number; totalPages: number }> {
    const { bookings, total } = await bookingRepository.findByUser(userId, options);
    const totalPages = Math.ceil(total / options.limit);

    return {
      bookings,
      total,
      page: options.page,
      totalPages,
    };
  }

  async getBookingsByEmail(
    email: string,
    options: PaginationOptions
  ): Promise<{ bookings: IBooking[]; total: number; page: number; totalPages: number }> {
    const { bookings, total } = await bookingRepository.findByEmail(email, options);
    const totalPages = Math.ceil(total / options.limit);

    return {
      bookings,
      total,
      page: options.page,
      totalPages,
    };
  }

  async getUpcomingBookings(limit: number = 10): Promise<IBooking[]> {
    return await bookingRepository.findUpcomingBookings(limit);
  }

  async getUpcomingBookingsByUser(userId: string): Promise<IBooking[]> {
    return await bookingRepository.findUpcomingByUser(userId);
  }

  async getUpcomingBookingsByEmail(email: string): Promise<IBooking[]> {
    return await bookingRepository.findUpcomingByEmail(email);
  }

  async getUpcomingBookingsByCounselor(counselorId: string): Promise<IBooking[]> {
    return await bookingRepository.findUpcomingByCounselor(counselorId);
  }

  async updateBooking(id: string, data: UpdateBookingInput): Promise<IBooking> {
    const booking = await this.getBookingById(id);

    // Don't allow updates to cancelled or completed bookings
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      throw new AppError(`Cannot update ${booking.status} bookings`, 400);
    }

    // If date/time is being changed, check availability
    if (data.bookingDate || data.bookingTime) {
      const newDate = data.bookingDate || booking.bookingDate;
      const newTime = data.bookingTime || booking.bookingTime;

      // Extract counselor ID - handle both populated and non-populated cases
      const counselorId = (booking.counselorId as any)?._id
        ? (booking.counselorId as any)._id.toString()
        : booking.counselorId.toString();

      // Check if the new slot is available (excluding current booking)
      const bookingsForSlot = await bookingRepository.checkAvailability(
        counselorId,
        newDate,
        newTime
      );

      if (!bookingsForSlot) {
        throw new AppError('This time slot is not available. Please choose another time.', 400);
      }
    }

    const updatedBooking = await bookingRepository.update(id, data);
    if (!updatedBooking) {
      throw new AppError('Booking not found', 404);
    }

    return updatedBooking;
  }

  async confirmBooking(id: string, meetingLink: string): Promise<IBooking> {
    const booking = await this.getBookingById(id);

    if (booking.status !== 'pending') {
      throw new AppError('Only pending bookings can be confirmed', 400);
    }

    if (!meetingLink || meetingLink.trim() === '') {
      throw new AppError('Meeting link is required to confirm booking', 400);
    }

    const updatedBooking = await bookingRepository.update(id, {
      status: 'confirmed',
      meetingLink: meetingLink.trim()
    });
    if (!updatedBooking) {
      throw new AppError('Booking not found', 404);
    }

    // Send approval email with meeting link (non-blocking)
    // Extract counselor ID - handle both populated and non-populated cases
    // If counselorId is populated (object with properties), extract the _id
    // Otherwise, it's already an ObjectId
    let counselorId: string;
    if (typeof booking.counselorId === 'object' && booking.counselorId !== null) {
      // It's populated - extract the MongoDB _id
      counselorId = (booking.counselorId as any)._id?.toString() || (booking.counselorId as any).id?.toString();
    } else {
      // It's an ObjectId
      counselorId = (booking.counselorId as any).toString();
    }

    const counselor = await counselorRepository.findById(counselorId);
    if (counselor) {
      bookingEmailService.sendBookingApproval(updatedBooking, counselor).catch((error) => {
        console.error('Failed to send approval email:', error);
      });
    }

    return updatedBooking;
  }

  async cancelBooking(id: string, cancelData: CancelBookingInput): Promise<IBooking> {
    const booking = await this.getBookingById(id);

    if (booking.status === 'cancelled') {
      throw new AppError('Booking is already cancelled', 400);
    }

    if (booking.status === 'completed') {
      throw new AppError('Cannot cancel completed bookings', 400);
    }

    const updatedBooking = await bookingRepository.update(id, {
      status: 'cancelled',
      cancellationReason: cancelData.cancellationReason,
      cancelledAt: new Date(),
      cancelledBy: cancelData.cancelledBy,
    });

    if (!updatedBooking) {
      throw new AppError('Booking not found', 404);
    }

    // Send cancellation email (non-blocking)
    // Extract counselor ID - handle both populated and non-populated cases
    const counselorId = (booking.counselorId as any)?._id
      ? (booking.counselorId as any)._id.toString()
      : booking.counselorId.toString();

    const counselor = await counselorRepository.findById(counselorId);
    if (counselor) {
      bookingEmailService.sendBookingCancellation(updatedBooking, counselor).catch((error) => {
        console.error('Failed to send cancellation email:', error);
      });
    }

    return updatedBooking;
  }

  async completeBooking(id: string): Promise<IBooking> {
    const booking = await this.getBookingById(id);

    if (booking.status !== 'confirmed') {
      throw new AppError('Only confirmed bookings can be marked as completed', 400);
    }

    const updatedBooking = await bookingRepository.update(id, { status: 'completed' });
    if (!updatedBooking) {
      throw new AppError('Booking not found', 404);
    }

    return updatedBooking;
  }

  async markNoShow(id: string): Promise<IBooking> {
    const booking = await this.getBookingById(id);

    if (booking.status !== 'confirmed') {
      throw new AppError('Only confirmed bookings can be marked as no-show', 400);
    }

    const updatedBooking = await bookingRepository.update(id, { status: 'no-show' });
    if (!updatedBooking) {
      throw new AppError('Booking not found', 404);
    }

    return updatedBooking;
  }

  async deleteBooking(id: string): Promise<void> {
    await bookingRepository.delete(id);
  }

  async getBookingStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    noShow: number;
  }> {
    return await bookingRepository.getStats();
  }

  async getCounselorBookingsForDate(counselorId: string, date: Date): Promise<IBooking[]> {
    return await bookingRepository.getCounselorBookingsForDate(counselorId, date);
  }

  async sendReminders(): Promise<void> {
    const bookings = await bookingRepository.findBookingsNeedingReminder();

    for (const booking of bookings) {
      try {
        // Extract counselor ID - handle both populated and non-populated cases
        const counselorId = (booking.counselorId as any)?._id
          ? (booking.counselorId as any)._id.toString()
          : booking.counselorId.toString();

        const counselor = await counselorRepository.findById(counselorId);
        if (counselor) {
          const emailSent = await bookingEmailService.sendBookingReminder(booking, counselor);

          if (emailSent) {
            await bookingRepository.update(booking._id, { reminderEmailSent: true });
          }
        }
      } catch (error) {
        console.error(`Failed to send reminder for booking ${booking._id}:`, error);
      }
    }
  }

  private async sendConfirmationEmail(booking: IBooking, counselor: ICounselor): Promise<void> {
    try {
      const emailSent = await bookingEmailService.sendBookingConfirmation(booking, counselor);

      if (emailSent) {
        await bookingRepository.update(booking._id, { confirmationEmailSent: true });
      }
    } catch (error) {
      console.error(`Failed to send confirmation email for booking ${booking._id}:`, error);
    }
  }
}

export default new BookingService();
