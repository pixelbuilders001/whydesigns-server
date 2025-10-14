import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Category name is required',
    'string.min': 'Category name must be at least 2 characters',
    'string.max': 'Category name must not exceed 50 characters',
  }),
  slug: Joi.string()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional()
    .messages({
      'string.pattern.base': 'Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)',
    }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    'string.min': 'Category name must be at least 2 characters',
    'string.max': 'Category name must not exceed 50 characters',
  }),
  slug: Joi.string()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional()
    .messages({
      'string.pattern.base': 'Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)',
    }),
  description: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Description must not exceed 500 characters',
  }),
  isActive: Joi.boolean().optional(),
});

export const categoryPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().optional(),
  includeInactive: Joi.boolean().optional().default(false),
});

export const categoryIdParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Category ID is required',
  }),
});

export const categorySlugParamSchema = Joi.object({
  slug: Joi.string().required().messages({
    'string.empty': 'Category slug is required',
  }),
});
