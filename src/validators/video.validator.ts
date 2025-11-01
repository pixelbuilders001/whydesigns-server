import Joi from 'joi';

export const createVideoSchema = Joi.object({
  title: Joi.string().min(2).max(200).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 2 characters long',
    'string.max': 'Title cannot exceed 200 characters',
  }),
  description: Joi.string().max(2000).optional().allow('').messages({
    'string.max': 'Description cannot exceed 2000 characters',
  }),
  videoUrl: Joi.string().uri().required().messages({
    'string.empty': 'Video URL is required',
    'string.uri': 'Video URL must be a valid URL',
  }),
  thumbnailUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Thumbnail URL must be a valid URL',
  }),
  posterUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Poster URL must be a valid URL',
  }),
  duration: Joi.number().min(1).required().messages({
    'number.base': 'Duration must be a number',
    'number.min': 'Duration must be at least 1 second',
    'any.required': 'Duration is required',
  }),
  fileSize: Joi.number().min(0).required().messages({
    'number.base': 'File size must be a number',
    'number.min': 'File size cannot be negative',
    'any.required': 'File size is required',
  }),
  tags: Joi.array().items(Joi.string()).max(20).optional().messages({
    'array.max': 'Cannot have more than 20 tags',
  }),
  category: Joi.string().max(50).optional().allow('').messages({
    'string.max': 'Category cannot exceed 50 characters',
  }),
  isPublished: Joi.boolean().optional(),
  displayOrder: Joi.number().min(0).optional().messages({
    'number.min': 'Display order cannot be negative',
  }),
});

export const updateVideoSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional().messages({
    'string.min': 'Title must be at least 2 characters long',
    'string.max': 'Title cannot exceed 200 characters',
  }),
  description: Joi.string().max(2000).optional().allow('').messages({
    'string.max': 'Description cannot exceed 2000 characters',
  }),
  videoUrl: Joi.string().uri().optional().messages({
    'string.uri': 'Video URL must be a valid URL',
  }),
  thumbnailUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Thumbnail URL must be a valid URL',
  }),
  posterUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Poster URL must be a valid URL',
  }),
  duration: Joi.number().min(1).optional().messages({
    'number.base': 'Duration must be a number',
    'number.min': 'Duration must be at least 1 second',
  }),
  fileSize: Joi.number().min(0).optional().messages({
    'number.base': 'File size must be a number',
    'number.min': 'File size cannot be negative',
  }),
  tags: Joi.array().items(Joi.string()).max(20).optional().messages({
    'array.max': 'Cannot have more than 20 tags',
  }),
  category: Joi.string().max(50).optional().allow('').messages({
    'string.max': 'Category cannot exceed 50 characters',
  }),
  isPublished: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  displayOrder: Joi.number().min(0).optional().messages({
    'number.min': 'Display order cannot be negative',
  }),
  viewCount: Joi.number().min(0).optional().messages({
    'number.min': 'View count cannot be negative',
  }),
  likeCount: Joi.number().min(0).optional().messages({
    'number.min': 'Like count cannot be negative',
  }),
}).min(1);

export const getVideosQuerySchema = Joi.object({
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
    .valid('createdAt', 'publishedAt', 'viewCount', 'likeCount', 'displayOrder', 'title')
    .optional()
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: createdAt, publishedAt, viewCount, likeCount, displayOrder, title',
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc').messages({
    'any.only': 'Sort order must be either asc or desc',
  }),
  isPublished: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  category: Joi.string().optional(),
  tags: Joi.string().optional(),
  search: Joi.string().optional(),
});

export const videoIdParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid video ID format',
      'any.required': 'Video ID is required',
    }),
});

export const categoryParamSchema = Joi.object({
  category: Joi.string().required().messages({
    'string.empty': 'Category is required',
    'any.required': 'Category is required',
  }),
});

export const tagsQuerySchema = Joi.object({
  tags: Joi.string().required().messages({
    'string.empty': 'Tags are required',
    'any.required': 'Tags are required',
  }),
  page: Joi.number().min(1).optional().default(1),
  limit: Joi.number().min(1).max(100).optional().default(10),
  sortBy: Joi.string()
    .valid('createdAt', 'publishedAt', 'viewCount', 'likeCount', 'displayOrder', 'title')
    .optional()
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
});

export const searchQuerySchema = Joi.object({
  q: Joi.string().min(2).required().messages({
    'string.empty': 'Search query is required',
    'string.min': 'Search query must be at least 2 characters long',
  }),
  page: Joi.number().min(1).optional().default(1),
  limit: Joi.number().min(1).max(100).optional().default(10),
  sortBy: Joi.string()
    .valid('createdAt', 'publishedAt', 'viewCount', 'likeCount', 'displayOrder', 'title')
    .optional()
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc'),
});

export const limitQuerySchema = Joi.object({
  limit: Joi.number().min(1).max(100).optional().default(10).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),
});
