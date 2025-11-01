import Joi from 'joi';

export const createCounselorSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name must not exceed 100 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  title: Joi.string().max(100).required().messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must not exceed 100 characters',
  }),
  yearsOfExperience: Joi.number().integer().min(0).max(100).required().messages({
    'number.base': 'Years of experience must be a number',
    'number.min': 'Years of experience cannot be negative',
    'number.max': 'Years of experience must not exceed 100',
    'any.required': 'Years of experience is required',
  }),
  bio: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'Bio is required',
    'string.min': 'Bio must be at least 10 characters',
    'string.max': 'Bio must not exceed 2000 characters',
  }),
  avatarUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Avatar URL must be a valid URL',
  }),
  specialties: Joi.array().items(Joi.string()).min(1).max(20).required().messages({
    'array.base': 'Specialties must be an array',
    'array.min': 'At least one specialty is required',
    'array.max': 'A counselor can have a maximum of 20 specialties',
    'any.required': 'Specialties are required',
  }),
  isActive: Joi.boolean().optional().default(true),
  rating: Joi.number().min(0).max(5).optional().default(0).messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating cannot be negative',
    'number.max': 'Rating cannot exceed 5',
  }),
});

export const updateCounselorSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Full name must be at least 2 characters',
    'string.max': 'Full name must not exceed 100 characters',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address',
  }),
  title: Joi.string().max(100).optional().messages({
    'string.max': 'Title must not exceed 100 characters',
  }),
  yearsOfExperience: Joi.number().integer().min(0).max(100).optional().messages({
    'number.base': 'Years of experience must be a number',
    'number.min': 'Years of experience cannot be negative',
    'number.max': 'Years of experience must not exceed 100',
  }),
  bio: Joi.string().min(10).max(2000).optional().messages({
    'string.min': 'Bio must be at least 10 characters',
    'string.max': 'Bio must not exceed 2000 characters',
  }),
  avatarUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Avatar URL must be a valid URL',
  }),
  specialties: Joi.array().items(Joi.string()).min(1).max(20).optional().messages({
    'array.base': 'Specialties must be an array',
    'array.min': 'At least one specialty is required',
    'array.max': 'A counselor can have a maximum of 20 specialties',
  }),
  isActive: Joi.boolean().optional(),
  rating: Joi.number().min(0).max(5).optional().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating cannot be negative',
    'number.max': 'Rating cannot exceed 5',
  }),
});

export const updateCounselorRatingSchema = Joi.object({
  rating: Joi.number().min(0).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating cannot be negative',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required',
  }),
});

export const counselorPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().optional(),
  specialty: Joi.string().optional(),
  includeInactive: Joi.boolean().optional().default(false),
});

export const counselorIdParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid counselor ID format',
      'any.required': 'Counselor ID is required',
    }),
});

export const topCounselorsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 100',
  }),
});
