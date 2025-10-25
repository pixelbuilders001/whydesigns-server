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
  banners: Joi.array()
    .items(
      Joi.object({
        imageUrl: Joi.string().uri().required().messages({
          'string.empty': 'Banner image URL is required',
          'string.uri': 'Banner image URL must be a valid URL',
        }),
        link: Joi.string().uri().optional().allow('').messages({
          'string.uri': 'Link must be a valid URL',
        }),
        altText: Joi.string().max(200).optional().allow('').messages({
          'string.max': 'Alt text cannot exceed 200 characters',
        }),
        displayOrder: Joi.number().min(0).optional().default(0).messages({
          'number.min': 'Display order cannot be negative',
        }),
      })
    )
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.min': 'At least one banner is required',
      'array.max': 'Cannot have more than 10 banners in a group',
      'any.required': 'Banners array is required',
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
  banners: Joi.array()
    .items(
      Joi.object({
        imageUrl: Joi.string().uri().required().messages({
          'string.empty': 'Banner image URL is required',
          'string.uri': 'Banner image URL must be a valid URL',
        }),
        link: Joi.string().uri().optional().allow('').messages({
          'string.uri': 'Link must be a valid URL',
        }),
        altText: Joi.string().max(200).optional().allow('').messages({
          'string.max': 'Alt text cannot exceed 200 characters',
        }),
        displayOrder: Joi.number().min(0).optional().default(0).messages({
          'number.min': 'Display order cannot be negative',
        }),
      })
    )
    .min(1)
    .max(10)
    .optional()
    .messages({
      'array.min': 'At least one banner is required',
      'array.max': 'Cannot have more than 10 banners in a group',
    }),
  isActive: Joi.boolean().optional(),
}).min(1);

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
