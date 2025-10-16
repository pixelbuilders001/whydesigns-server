import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

export interface IBooking extends Document {
  _id: string;
  counselorId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Optional - for logged-in users
  // Guest information (for non-logged-in users)
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  // Booking details
  bookingDate: Date;
  bookingTime: string; // Format: "HH:MM" (e.g., "14:30")
  duration: number; // Duration in minutes (default: 60)
  // Additional information
  discussionTopic: string;
  // Status tracking
  status: BookingStatus;
  // Google Calendar integration
  googleCalendarEventId?: string;
  meetingLink?: string; // For online sessions
  // Notifications
  confirmationEmailSent: boolean;
  reminderEmailSent: boolean;
  // Cancellation
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: 'user' | 'admin' | 'counselor';
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    counselorId: {
      type: Schema.Types.ObjectId,
      ref: 'Counselor',
      required: [true, 'Counselor is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      // Optional - null for guest bookings
    },
    guestName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    guestEmail: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
      index: true,
    },
    guestPhone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    bookingDate: {
      type: Date,
      required: [true, 'Booking date is required'],
      index: true,
    },
    bookingTime: {
      type: String,
      required: [true, 'Booking time is required'],
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format (e.g., 14:30)'],
    },
    duration: {
      type: Number,
      required: true,
      default: 60,
      min: [15, 'Duration must be at least 15 minutes'],
      max: [240, 'Duration cannot exceed 240 minutes'],
    },
    discussionTopic: {
      type: String,
      required: [true, 'Discussion topic is required'],
      trim: true,
      minlength: [5, 'Discussion topic must be at least 5 characters'],
      maxlength: [500, 'Discussion topic must not exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'pending',
      index: true,
    },
    googleCalendarEventId: {
      type: String,
      trim: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    confirmationEmailSent: {
      type: Boolean,
      default: false,
    },
    reminderEmailSent: {
      type: Boolean,
      default: false,
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Cancellation reason must not exceed 500 characters'],
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'admin', 'counselor'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Compound indexes for efficient queries
bookingSchema.index({ counselorId: 1, bookingDate: 1 });
bookingSchema.index({ counselorId: 1, status: 1 });
bookingSchema.index({ guestEmail: 1, status: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ bookingDate: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for full booking datetime
bookingSchema.virtual('bookingDateTime').get(function (this: IBooking) {
  const date = new Date(this.bookingDate);
  const [hours, minutes] = this.bookingTime.split(':');
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return date;
});

// Virtual for end time
bookingSchema.virtual('endDateTime').get(function (this: IBooking) {
  const startTime = this.get('bookingDateTime');
  return new Date(startTime.getTime() + this.duration * 60000);
});

// Virtual to check if booking is upcoming
bookingSchema.virtual('isUpcoming').get(function (this: IBooking) {
  const startTime = this.get('bookingDateTime');
  return startTime > new Date() && this.status !== 'cancelled' && this.status !== 'completed';
});

// Virtual to check if booking is past
bookingSchema.virtual('isPast').get(function (this: IBooking) {
  const endTime = this.get('endDateTime');
  return endTime < new Date();
});

// Validate that booking date is in the future
bookingSchema.pre('validate', function (next) {
  if (this.isNew && this.bookingDate) {
    const bookingDateTime = new Date(this.bookingDate);
    const [hours, minutes] = this.bookingTime.split(':');
    bookingDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    if (bookingDateTime <= new Date()) {
      this.invalidate('bookingDate', 'Booking must be scheduled for a future date and time');
    }
  }
  next();
});

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
