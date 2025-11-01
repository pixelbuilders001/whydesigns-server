import { IBooking, BookingStatus } from '../models/booking.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { PaginationOptions } from '../types';
import { createBaseFields } from '../models/base.model';

export class BookingRepository extends BaseRepository<IBooking> {
  constructor() {
    super(TABLES.BOOKINGS);
  }

  async create(bookingData: Partial<IBooking>): Promise<IBooking> {
    const id = this.generateId();

    const booking: IBooking = {
      id,
      counselorId: bookingData.counselorId || '',
      userId: bookingData.userId,
      guestName: bookingData.guestName || '',
      guestEmail: bookingData.guestEmail || '',
      guestPhone: bookingData.guestPhone || '',
      bookingDate: bookingData.bookingDate || new Date().toISOString(),
      bookingTime: bookingData.bookingTime || '',
      duration: bookingData.duration || 60,
      discussionTopic: bookingData.discussionTopic || '',
      status: bookingData.status || 'pending',
      confirmationEmailSent: bookingData.confirmationEmailSent || false,
      reminderEmailSent: bookingData.reminderEmailSent || false,
      ...createBaseFields(),
    };

    return await this.putItem(booking);
  }

  async findById(id: string): Promise<IBooking | null> {
    return await this.getItem({ id: id });
  }

  async findAll(options: PaginationOptions): Promise<{ bookings: IBooking[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    // Sort in memory
    const sortedBookings = this.sortItems(result.items, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedBookings = sortedBookings.slice(skip, skip + limit);

    return { bookings: paginatedBookings, total: sortedBookings.length };
  }

  async findByStatus(
    status: BookingStatus,
    options: PaginationOptions
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    const result = await this.scanItems({
      filterExpression: '#status = :status AND #isActive = :isActive',
      expressionAttributeNames: { '#status': 'status', '#isActive': 'isActive' },
      expressionAttributeValues: { ':status': status, ':isActive': true },
    });

    // Sort in memory
    const sortedBookings = this.sortItems(result.items, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedBookings = sortedBookings.slice(skip, skip + limit);

    return { bookings: paginatedBookings, total: sortedBookings.length };
  }

  async findByCounselor(
    counselorId: string,
    options: PaginationOptions
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    const result = await this.scanItems({
      filterExpression: '#counselorId = :counselorId AND #isActive = :isActive',
      expressionAttributeNames: { '#counselorId': 'counselorId', '#isActive': 'isActive' },
      expressionAttributeValues: { ':counselorId': counselorId, ':isActive': true },
    });

    // Sort in memory
    const sortedBookings = this.sortItems(result.items, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedBookings = sortedBookings.slice(skip, skip + limit);

    return { bookings: paginatedBookings, total: sortedBookings.length };
  }

  async findByUser(
    userId: string,
    options: PaginationOptions
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    const result = await this.scanItems({
      filterExpression: '#userId = :userId AND #isActive = :isActive',
      expressionAttributeNames: { '#userId': 'userId', '#isActive': 'isActive' },
      expressionAttributeValues: { ':userId': userId, ':isActive': true },
    });

    // Sort in memory
    const sortedBookings = this.sortItems(result.items, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedBookings = sortedBookings.slice(skip, skip + limit);

    return { bookings: paginatedBookings, total: sortedBookings.length };
  }

  async findByEmail(
    email: string,
    options: PaginationOptions
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    const result = await this.scanItems({
      filterExpression: '#guestEmail = :guestEmail AND #isActive = :isActive',
      expressionAttributeNames: { '#guestEmail': 'guestEmail', '#isActive': 'isActive' },
      expressionAttributeValues: { ':guestEmail': email.toLowerCase(), ':isActive': true },
    });

    // Sort in memory
    const sortedBookings = this.sortItems(result.items, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedBookings = sortedBookings.slice(skip, skip + limit);

    return { bookings: paginatedBookings, total: sortedBookings.length };
  }

  async findUpcomingBookings(limit: number = 10): Promise<IBooking[]> {
    const now = new Date().toISOString();

    const result = await this.scanItems({
      filterExpression: '#bookingDate >= :now AND (#status = :pending OR #status = :confirmed) AND #isActive = :isActive',
      expressionAttributeNames: {
        '#bookingDate': 'bookingDate',
        '#status': 'status',
        '#isActive': 'isActive',
      },
      expressionAttributeValues: {
        ':now': now,
        ':pending': 'pending',
        ':confirmed': 'confirmed',
        ':isActive': true,
      },
    });

    // Sort by bookingDate and bookingTime
    const sorted = result.items.sort((a, b) => {
      const dateCompare = a.bookingDate.localeCompare(b.bookingDate);
      if (dateCompare !== 0) return dateCompare;
      return a.bookingTime.localeCompare(b.bookingTime);
    });

    return sorted.slice(0, limit);
  }

  async findUpcomingByUser(userId: string): Promise<IBooking[]> {
    const now = new Date().toISOString();

    const result = await this.scanItems({
      filterExpression: '#userId = :userId AND #bookingDate >= :now AND (#status = :pending OR #status = :confirmed) AND #isActive = :isActive',
      expressionAttributeNames: {
        '#userId': 'userId',
        '#bookingDate': 'bookingDate',
        '#status': 'status',
        '#isActive': 'isActive',
      },
      expressionAttributeValues: {
        ':userId': userId,
        ':now': now,
        ':pending': 'pending',
        ':confirmed': 'confirmed',
        ':isActive': true,
      },
    });

    return result.items.sort((a, b) => {
      const dateCompare = a.bookingDate.localeCompare(b.bookingDate);
      if (dateCompare !== 0) return dateCompare;
      return a.bookingTime.localeCompare(b.bookingTime);
    });
  }

  async findUpcomingByEmail(email: string): Promise<IBooking[]> {
    const now = new Date().toISOString();

    const result = await this.scanItems({
      filterExpression: '#guestEmail = :guestEmail AND #bookingDate >= :now AND (#status = :pending OR #status = :confirmed) AND #isActive = :isActive',
      expressionAttributeNames: {
        '#guestEmail': 'guestEmail',
        '#bookingDate': 'bookingDate',
        '#status': 'status',
        '#isActive': 'isActive',
      },
      expressionAttributeValues: {
        ':guestEmail': email.toLowerCase(),
        ':now': now,
        ':pending': 'pending',
        ':confirmed': 'confirmed',
        ':isActive': true,
      },
    });

    return result.items.sort((a, b) => {
      const dateCompare = a.bookingDate.localeCompare(b.bookingDate);
      if (dateCompare !== 0) return dateCompare;
      return a.bookingTime.localeCompare(b.bookingTime);
    });
  }

  async findUpcomingByCounselor(counselorId: string): Promise<IBooking[]> {
    const now = new Date().toISOString();

    const result = await this.scanItems({
      filterExpression: '#counselorId = :counselorId AND #bookingDate >= :now AND (#status = :pending OR #status = :confirmed) AND #isActive = :isActive',
      expressionAttributeNames: {
        '#counselorId': 'counselorId',
        '#bookingDate': 'bookingDate',
        '#status': 'status',
        '#isActive': 'isActive',
      },
      expressionAttributeValues: {
        ':counselorId': counselorId,
        ':now': now,
        ':pending': 'pending',
        ':confirmed': 'confirmed',
        ':isActive': true,
      },
    });

    return result.items.sort((a, b) => {
      const dateCompare = a.bookingDate.localeCompare(b.bookingDate);
      if (dateCompare !== 0) return dateCompare;
      return a.bookingTime.localeCompare(b.bookingTime);
    });
  }

  async update(id: string, updateData: Partial<IBooking>): Promise<IBooking | null> {
    return await this.updateItem({ id: id }, updateData);
  }

  async delete(id: string): Promise<IBooking | null> {
    const booking = await this.findById(id);
    await this.hardDeleteItem({ id: id });
    return booking;
  }

  async softDelete(id: string): Promise<IBooking | null> {
    return await this.softDeleteItem({ id: id });
  }

  async checkAvailability(counselorId: string, bookingDate: Date, bookingTime: string): Promise<boolean> {
    const dateStr = bookingDate.toISOString();

    const result = await this.scanItems({
      filterExpression: '#counselorId = :counselorId AND #bookingDate = :bookingDate AND #bookingTime = :bookingTime AND (#status = :pending OR #status = :confirmed) AND #isActive = :isActive',
      expressionAttributeNames: {
        '#counselorId': 'counselorId',
        '#bookingDate': 'bookingDate',
        '#bookingTime': 'bookingTime',
        '#status': 'status',
        '#isActive': 'isActive',
      },
      expressionAttributeValues: {
        ':counselorId': counselorId,
        ':bookingDate': dateStr,
        ':bookingTime': bookingTime,
        ':pending': 'pending',
        ':confirmed': 'confirmed',
        ':isActive': true,
      },
    });

    return result.items.length === 0; // Available if no existing booking found
  }

  async getCounselorBookingsForDate(counselorId: string, date: Date): Promise<IBooking[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.scanItems({
      filterExpression: '#counselorId = :counselorId AND #bookingDate BETWEEN :startOfDay AND :endOfDay AND (#status = :pending OR #status = :confirmed) AND #isActive = :isActive',
      expressionAttributeNames: {
        '#counselorId': 'counselorId',
        '#bookingDate': 'bookingDate',
        '#status': 'status',
        '#isActive': 'isActive',
      },
      expressionAttributeValues: {
        ':counselorId': counselorId,
        ':startOfDay': startOfDay.toISOString(),
        ':endOfDay': endOfDay.toISOString(),
        ':pending': 'pending',
        ':confirmed': 'confirmed',
        ':isActive': true,
      },
    });

    return result.items.sort((a, b) => a.bookingTime.localeCompare(b.bookingTime));
  }

  async countByStatus(status: BookingStatus): Promise<number> {
    return await this.countItems(
      '#status = :status AND #isActive = :isActive',
      { '#status': 'status', '#isActive': 'isActive' },
      { ':status': status, ':isActive': true }
    );
  }

  async countByCounselor(counselorId: string): Promise<number> {
    return await this.countItems(
      '#counselorId = :counselorId AND #isActive = :isActive',
      { '#counselorId': 'counselorId', '#isActive': 'isActive' },
      { ':counselorId': counselorId, ':isActive': true }
    );
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    noShow: number;
  }> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    const total = result.items.length;
    const pending = result.items.filter(b => b.status === 'pending').length;
    const confirmed = result.items.filter(b => b.status === 'confirmed').length;
    const cancelled = result.items.filter(b => b.status === 'cancelled').length;
    const completed = result.items.filter(b => b.status === 'completed').length;
    const noShow = result.items.filter(b => b.status === 'no-show').length;

    return {
      total,
      pending,
      confirmed,
      cancelled,
      completed,
      noShow,
    };
  }

  async findBookingsNeedingReminder(): Promise<IBooking[]> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await this.scanItems({
      filterExpression: '#bookingDate BETWEEN :now AND :tomorrow AND #status = :confirmed AND #reminderEmailSent = :false AND #isActive = :isActive',
      expressionAttributeNames: {
        '#bookingDate': 'bookingDate',
        '#status': 'status',
        '#reminderEmailSent': 'reminderEmailSent',
        '#isActive': 'isActive',
      },
      expressionAttributeValues: {
        ':now': now.toISOString(),
        ':tomorrow': tomorrow.toISOString(),
        ':confirmed': 'confirmed',
        ':false': false,
        ':isActive': true,
      },
    });

    return result.items;
  }

  /**
   * Helper method to sort items in memory
   */
  private sortItems(items: IBooking[], sortBy: string, order: string): IBooking[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new BookingRepository();
