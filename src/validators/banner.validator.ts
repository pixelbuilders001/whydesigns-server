import Joi from 'joi';

export const createBannerSchema = Joi.object({
  title: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 2 characters long',
    'string.max': 'Title cannot exceed 100 characters',
  }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  bannersMetadata: Joi.string().optional().allow('').messages({
    'string.base': 'Banners metadata must be a JSON string',
  }),
});

export const updateBannerSchema = Joi.object({
  title: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Title must be at least 2 characters long',
    'string.max': 'Title cannot exceed 100 characters',
  }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  bannersMetadata: Joi.string().optional().allow('').messages({
    'string.base': 'Banners metadata must be a JSON string',
  }),
  isActive: Joi.boolean().optional(),
});

export const getBannersQuerySchema = Joi.object({
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
    .valid('createdAt', 'publishedAt', 'title')
    .optional()
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: createdAt, publishedAt, title',
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc').messages({
    'any.only': 'Sort order must be either asc or desc',
  }),
  isPublished: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().optional(),
});

export const bannerIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid banner ID format',
      'any.required': 'Banner ID is required',
    }),
});
