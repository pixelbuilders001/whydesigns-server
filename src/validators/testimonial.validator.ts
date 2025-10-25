import Joi from 'joi';

export const createTestimonialSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  city: Joi.string().min(2).max(100).optional().allow('').messages({
    'string.min': 'City must be at least 2 characters long',
    'string.max': 'City cannot exceed 100 characters',
  }),
  state: Joi.string().min(2).max(100).optional().allow('').messages({
    'string.min': 'State must be at least 2 characters long',
    'string.max': 'State cannot exceed 100 characters',
  }),
  country: Joi.string().max(100).optional().messages({
    'string.max': 'Country cannot exceed 100 characters',
  }),
  rating: Joi.number().min(1).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required',
  }),
  message: Joi.string().min(10).max(2000).required().messages({
    'string.empty': 'Testimonial message is required',
    'string.min': 'Message must be at least 10 characters long',
    'string.max': 'Message cannot exceed 2000 characters',
  }),
  designation: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Designation cannot exceed 100 characters',
  }),
  company: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Company name cannot exceed 100 characters',
  }),
  profileImage: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Profile image must be a valid URL',
  }),
  socialMedia: Joi.object({
    facebook: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Please provide a valid URL',
      }),
    instagram: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Please provide a valid URL',
      }),
    twitter: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Please provide a valid URL',
      }),
    linkedin: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Please provide a valid URL',
      }),
  }).optional(),
  // Support form-data format (socialMedia.facebook, etc.)
  'socialMedia.facebook': Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid URL',
    }),
  'socialMedia.instagram': Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid URL',
    }),
  'socialMedia.twitter': Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid URL',
    }),
  'socialMedia.linkedin': Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid URL',
    }),
});

export const updateTestimonialSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address',
  }),
  city: Joi.string().min(2).max(100).optional().allow('').messages({
    'string.min': 'City must be at least 2 characters long',
    'string.max': 'City cannot exceed 100 characters',
  }),
  state: Joi.string().min(2).max(100).optional().allow('').messages({
    'string.min': 'State must be at least 2 characters long',
    'string.max': 'State cannot exceed 100 characters',
  }),
  country: Joi.string().max(100).optional().messages({
    'string.max': 'Country cannot exceed 100 characters',
  }),
  rating: Joi.number().min(1).max(5).optional().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
  }),
  message: Joi.string().min(10).max(2000).optional().messages({
    'string.min': 'Message must be at least 10 characters long',
    'string.max': 'Message cannot exceed 2000 characters',
  }),
  designation: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Designation cannot exceed 100 characters',
  }),
  company: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Company name cannot exceed 100 characters',
  }),
  profileImage: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Profile image must be a valid URL',
  }),
  isFavorite: Joi.boolean().optional(),
  isApproved: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  displayOrder: Joi.number().min(0).optional().messages({
    'number.min': 'Display order cannot be negative',
  }),
  socialMedia: Joi.object({
    facebook: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Please provide a valid URL',
      }),
    instagram: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Please provide a valid URL',
      }),
    twitter: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Please provide a valid URL',
      }),
    linkedin: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Please provide a valid URL',
      }),
  }).optional(),
  // Support form-data format (socialMedia.facebook, etc.)
  'socialMedia.facebook': Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid URL',
    }),
  'socialMedia.instagram': Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid URL',
    }),
  'socialMedia.twitter': Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid URL',
    }),
  'socialMedia.linkedin': Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid URL',
    }),
}).min(1);

export const getTestimonialsQuerySchema = Joi.object({
  page: Joi.number().min(1).optional().default(1).messages({
    'number.base': 'Page must be a number',
    'number.min': 'Page must be at least 1',
  }),
  limit: Joi.number().min(1).max(100).optional().default(10).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),
  sortBy: Joi.string()
    .valid('createdAt', 'rating', 'displayOrder', 'name')
    .optional()
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: createdAt, rating, displayOrder, name',
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc').messages({
    'any.only': 'Sort order must be either asc or desc',
  }),
  isApproved: Joi.boolean().optional(),
  isFavorite: Joi.boolean().optional(),
  rating: Joi.number().min(1).max(5).optional().messages({
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
  }),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  search: Joi.string().optional(),
});

export const testimonialIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid testimonial ID format',
      'any.required': 'Testimonial ID is required',
    }),
});

export const ratingParamSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required',
  }),
});

export const locationQuerySchema = Joi.object({
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  page: Joi.number().min(1).optional().default(1),
  limit: Joi.number().min(1).max(100).optional().default(10),
  sortBy: Joi.string()
    .valid('createdAt', 'rating', 'displayOrder', 'name')
    .optional()
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
}).or('city', 'state');

export const searchQuerySchema = Joi.object({
  q: Joi.string().min(2).required().messages({
    'string.empty': 'Search query is required',
    'string.min': 'Search query must be at least 2 characters long',
  }),
  page: Joi.number().min(1).optional().default(1),
  limit: Joi.number().min(1).max(100).optional().default(10),
  sortBy: Joi.string()
    .valid('createdAt', 'rating', 'displayOrder', 'name')
    .optional()
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
});
