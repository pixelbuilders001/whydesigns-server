import { Booking, IBooking, BookingStatus } from '../models/booking.model';
import { PaginationOptions } from '../types';

export class BookingRepository {
  async create(bookingData: Partial<IBooking>): Promise<IBooking> {
    const booking = await Booking.create(bookingData);
    return booking;
  }

  async findById(id: string): Promise<IBooking | null> {
    return await Booking.findOne({ _id: id, isActive: true })
      .populate('counselorId', '_id id fullName title avatarUrl specialties rating')
      .populate('userId', '_id firstName lastName email phoneNumber');
  }

  async findAll(options: PaginationOptions): Promise<{ bookings: IBooking[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const [bookings, total] = await Promise.all([
      Booking.find({ isActive: true })
        .populate('counselorId', '_id id fullName title avatarUrl specialties rating')
        .populate('userId', '_id firstName lastName email phoneNumber')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ isActive: true }),
    ]);

    return { bookings, total };
  }

  async findByStatus(
    status: BookingStatus,
    options: PaginationOptions
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const [bookings, total] = await Promise.all([
      Booking.find({ status, isActive: true })
        .populate('counselorId', '_id id fullName title avatarUrl specialties rating')
        .populate('userId', '_id firstName lastName email phoneNumber')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ status, isActive: true }),
    ]);

    return { bookings, total };
  }

  async findByCounselor(
    counselorId: string,
    options: PaginationOptions
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const [bookings, total] = await Promise.all([
      Booking.find({ counselorId, isActive: true })
        .populate('counselorId', '_id id fullName title avatarUrl specialties rating')
        .populate('userId', '_id firstName lastName email phoneNumber')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ counselorId, isActive: true }),
    ]);

    return { bookings, total };
  }

  async findByUser(
    userId: string,
    options: PaginationOptions
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const [bookings, total] = await Promise.all([
      Booking.find({ userId, isActive: true })
        .populate('counselorId', '_id id fullName title avatarUrl specialties rating')
        .populate('userId', '_id firstName lastName email phoneNumber')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ userId, isActive: true }),
    ]);

    return { bookings, total };
  }

  async findByEmail(
    email: string,
    options: PaginationOptions
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    const [bookings, total] = await Promise.all([
      Booking.find({ guestEmail: email.toLowerCase(), isActive: true })
        .populate('counselorId', '_id id fullName title avatarUrl specialties rating')
        .populate('userId', '_id firstName lastName email phoneNumber')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Booking.countDocuments({ guestEmail: email.toLowerCase(), isActive: true }),
    ]);

    return { bookings, total };
  }

  async findUpcomingBookings(limit: number = 10): Promise<IBooking[]> {
    const now = new Date();
    return await Booking.find({
      bookingDate: { $gte: now },
      status: { $in: ['pending', 'confirmed'] },
      isActive: true,
    })
      .populate('counselorId', '_id id fullName title avatarUrl specialties rating')
      .populate('userId', '_id firstName lastName email phoneNumber')
      .sort({ bookingDate: 1, bookingTime: 1 })
      .limit(limit);
  }

  async findUpcomingByUser(userId: string): Promise<IBooking[]> {
    const now = new Date();
    return await Booking.find({
      userId,
      bookingDate: { $gte: now },
      status: { $in: ['pending', 'confirmed'] },
      isActive: true,
    })
      .populate('counselorId', '_id id fullName title avatarUrl specialties rating')
      .sort({ bookingDate: 1, bookingTime: 1 });
  }

  async findUpcomingByEmail(email: string): Promise<IBooking[]> {
    const now = new Date();
    return await Booking.find({
      guestEmail: email.toLowerCase(),
      bookingDate: { $gte: now },
      status: { $in: ['pending', 'confirmed'] },
      isActive: true,
    })
      .populate('counselorId', '_id id fullName title avatarUrl specialties rating')
      .sort({ bookingDate: 1, bookingTime: 1 });
  }

  async findUpcomingByCounselor(counselorId: string): Promise<IBooking[]> {
    const now = new Date();
    return await Booking.find({
      counselorId,
      bookingDate: { $gte: now },
      status: { $in: ['pending', 'confirmed'] },
      isActive: true,
    })
      .populate('userId', '_id firstName lastName email phoneNumber')
      .sort({ bookingDate: 1, bookingTime: 1 });
  }

  async update(id: string, updateData: Partial<IBooking>): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('counselorId', '_id id fullName title avatarUrl specialties rating')
      .populate('userId', '_id firstName lastName email phoneNumber');
  }

  async delete(id: string): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  async hardDelete(id: string): Promise<IBooking | null> {
    return await Booking.findByIdAndDelete(id);
  }

  async checkAvailability(counselorId: string, bookingDate: Date, bookingTime: string): Promise<boolean> {
    // Check if there's any existing booking for the counselor at the same date and time
    const existingBooking = await Booking.findOne({
      counselorId,
      bookingDate,
      bookingTime,
      status: { $in: ['pending', 'confirmed'] },
      isActive: true,
    });

    return !existingBooking; // Available if no existing booking found
  }

  async getCounselorBookingsForDate(counselorId: string, date: Date): Promise<IBooking[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await Booking.find({
      counselorId,
      bookingDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $in: ['pending', 'confirmed'] },
      isActive: true,
    }).sort({ bookingTime: 1 });
  }

  async countByStatus(status: BookingStatus): Promise<number> {
    return await Booking.countDocuments({ status, isActive: true });
  }

  async countByCounselor(counselorId: string): Promise<number> {
    return await Booking.countDocuments({ counselorId, isActive: true });
  }

  async getStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    noShow: number;
  }> {
    const [total, pending, confirmed, cancelled, completed, noShow] = await Promise.all([
      Booking.countDocuments({ isActive: true }),
      Booking.countDocuments({ status: 'pending', isActive: true }),
      Booking.countDocuments({ status: 'confirmed', isActive: true }),
      Booking.countDocuments({ status: 'cancelled', isActive: true }),
      Booking.countDocuments({ status: 'completed', isActive: true }),
      Booking.countDocuments({ status: 'no-show', isActive: true }),
    ]);

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

    return await Booking.find({
      bookingDate: {
        $gte: now,
        $lte: tomorrow,
      },
      status: 'confirmed',
      reminderEmailSent: false,
      isActive: true,
    })
      .populate('counselorId', '_id id fullName title avatarUrl')
      .populate('userId', '_id firstName lastName email phoneNumber');
  }
}

export default new BookingRepository();
