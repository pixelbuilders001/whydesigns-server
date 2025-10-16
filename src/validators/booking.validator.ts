import Joi from 'joi';

// Create booking validation schema
export const createBookingSchema = Joi.object({
  counselorId: Joi.string()
    .required()
    .messages({
      'string.base': 'Counselor ID must be a string',
      'any.required': 'Counselor ID is required',
    }),
  userId: Joi.string()
    .optional()
    .messages({
      'string.base': 'User ID must be a string',
    }),
  guestName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required',
    }),
  guestEmail: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.base': 'Email must be a string',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  guestPhone: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Phone number must be a string',
      'any.required': 'Phone number is required',
    }),
  bookingDate: Joi.date()
    .iso()
    .min('now')
    .required()
    .messages({
      'date.base': 'Booking date must be a valid date',
      'date.min': 'Booking date must be in the future',
      'any.required': 'Booking date is required',
    }),
  bookingTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      'string.base': 'Booking time must be a string',
      'string.pattern.base': 'Booking time must be in HH:MM format (e.g., 14:30)',
      'any.required': 'Booking time is required',
    }),
  duration: Joi.number()
    .integer()
    .min(15)
    .max(240)
    .default(60)
    .messages({
      'number.base': 'Duration must be a number',
      'number.min': 'Duration must be at least 15 minutes',
      'number.max': 'Duration cannot exceed 240 minutes',
    }),
  sessionType: Joi.string()
    .valid('online', 'in-person')
    .required()
    .messages({
      'string.base': 'Session type must be a string',
      'any.only': 'Session type must be either "online" or "in-person"',
      'any.required': 'Session type is required',
    }),
  notes: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .messages({
      'string.base': 'Notes must be a string',
      'string.max': 'Notes must not exceed 1000 characters',
    }),
  reasonForBooking: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.base': 'Reason for booking must be a string',
      'string.max': 'Reason for booking must not exceed 500 characters',
    }),
  meetingLink: Joi.string()
    .uri()
    .trim()
    .optional()
    .messages({
      'string.base': 'Meeting link must be a string',
      'string.uri': 'Meeting link must be a valid URL',
    }),
});

// Update booking validation schema
export const updateBookingSchema = Joi.object({
  bookingDate: Joi.date()
    .iso()
    .min('now')
    .optional()
    .messages({
      'date.base': 'Booking date must be a valid date',
      'date.min': 'Booking date must be in the future',
    }),
  bookingTime: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional()
    .messages({
      'string.base': 'Booking time must be a string',
      'string.pattern.base': 'Booking time must be in HH:MM format (e.g., 14:30)',
    }),
  duration: Joi.number()
    .integer()
    .min(15)
    .max(240)
    .optional()
    .messages({
      'number.base': 'Duration must be a number',
      'number.min': 'Duration must be at least 15 minutes',
      'number.max': 'Duration cannot exceed 240 minutes',
    }),
  sessionType: Joi.string()
    .valid('online', 'in-person')
    .optional()
    .messages({
      'string.base': 'Session type must be a string',
      'any.only': 'Session type must be either "online" or "in-person"',
    }),
  notes: Joi.string()
    .trim()
    .max(1000)
    .optional()
    .messages({
      'string.base': 'Notes must be a string',
      'string.max': 'Notes must not exceed 1000 characters',
    }),
  reasonForBooking: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.base': 'Reason for booking must be a string',
      'string.max': 'Reason for booking must not exceed 500 characters',
    }),
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled', 'completed', 'no-show')
    .optional()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of: pending, confirmed, cancelled, completed, no-show',
    }),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// Cancel booking validation schema
export const cancelBookingSchema = Joi.object({
  cancellationReason: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.base': 'Cancellation reason must be a string',
      'string.max': 'Cancellation reason must not exceed 500 characters',
    }),
  cancelledBy: Joi.string()
    .valid('user', 'admin', 'counselor')
    .required()
    .messages({
      'string.base': 'Cancelled by must be a string',
      'any.only': 'Cancelled by must be one of: user, admin, counselor',
      'any.required': 'Cancelled by is required',
    }),
});

// Pagination and query validation
export const bookingPaginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
  sortBy: Joi.string()
    .valid('bookingDate', 'createdAt', 'status', 'bookingTime')
    .default('bookingDate')
    .messages({
      'string.base': 'Sort by must be a string',
      'any.only': 'Sort by must be one of: bookingDate, createdAt, status, bookingTime',
    }),
  order: Joi.string()
    .valid('asc', 'desc')
    .default('asc')
    .messages({
      'string.base': 'Order must be a string',
      'any.only': 'Order must be either "asc" or "desc"',
    }),
});

// Status query validation
export const statusQuerySchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'confirmed', 'cancelled', 'completed', 'no-show')
    .required()
    .messages({
      'string.base': 'Status must be a string',
      'any.only': 'Status must be one of: pending, confirmed, cancelled, completed, no-show',
      'any.required': 'Status is required',
    }),
  ...bookingPaginationSchema.describe().keys,
});

// Email query validation
export const emailQuerySchema = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.base': 'Email must be a string',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  ...bookingPaginationSchema.describe().keys,
});

// Date query validation
export const dateQuerySchema = Joi.object({
  date: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Date must be a valid date',
      'any.required': 'Date is required',
    }),
});

// Upcoming bookings limit validation
export const upcomingLimitSchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 50',
    }),
});
