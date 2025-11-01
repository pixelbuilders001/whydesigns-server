import { BaseModel } from './base.model';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

export interface IBooking extends BaseModel {
  id: string; // UUID - Primary Key
  counselorId: string; // Counselor ID
  userId?: string; // User ID (optional - for logged-in users)
  // Guest information (for non-logged-in users)
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  // Booking details
  bookingDate: string; // ISO 8601 date (YYYY-MM-DD)
  bookingTime: string; // Format: "HH:MM" (e.g., "14:30")
  duration: number; // Duration in minutes (default: 60)
  // Additional information
  discussionTopic: string;
  // Status tracking
  status: BookingStatus;
  // Video meeting
  meetingLink?: string;
  // Notifications
  confirmationEmailSent: boolean;
  reminderEmailSent: boolean;
  // Cancellation
  cancellationReason?: string;
  cancelledAt?: string; // ISO 8601 timestamp
  cancelledBy?: 'user' | 'admin' | 'counselor';
}

export interface CreateBookingInput {
  counselorId: string;
  userId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingDate: string;
  bookingTime: string;
  duration?: number;
  discussionTopic: string;
}

export interface UpdateBookingInput {
  status?: BookingStatus;
  meetingLink?: string;
  confirmationEmailSent?: boolean;
  reminderEmailSent?: boolean;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: 'user' | 'admin' | 'counselor';
  isActive?: boolean;
}

// Utility class for booking operations
export class BookingUtils {
  // Get booking datetime as Date object
  static getBookingDateTime(booking: IBooking): Date {
    const [hours, minutes] = booking.bookingTime.split(':');
    const date = new Date(booking.bookingDate);
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return date;
  }

  // Get end datetime
  static getEndDateTime(booking: IBooking): Date {
    const startTime = this.getBookingDateTime(booking);
    return new Date(startTime.getTime() + booking.duration * 60000);
  }

  // Check if booking is upcoming
  static isUpcoming(booking: IBooking): boolean {
    const startTime = this.getBookingDateTime(booking);
    return startTime > new Date() && booking.status !== 'cancelled' && booking.status !== 'completed';
  }

  // Check if booking is past
  static isPast(booking: IBooking): boolean {
    const endTime = this.getEndDateTime(booking);
    return endTime < new Date();
  }

  // Validate booking time is in future
  static isValidBookingTime(bookingDate: string, bookingTime: string): boolean {
    const [hours, minutes] = bookingTime.split(':');
    const bookingDateTime = new Date(bookingDate);
    bookingDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return bookingDateTime > new Date();
  }
}

export default IBooking;
