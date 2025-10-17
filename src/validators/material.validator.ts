import Joi from 'joi';

/**
 * Validation schema for creating a material
 */
export const createMaterialSchema = Joi.object({
  name: Joi.string().min(2).max(200).required().messages({
    'string.empty': 'Material name is required',
    'string.min': 'Material name must be at least 2 characters',
    'string.max': 'Material name must not exceed 200 characters',
    'any.required': 'Material name is required',
  }),
  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),
  category: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Category must not exceed 100 characters',
  }),
  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim()).max(10),
      Joi.string().trim()
    )
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags',
    }),
});

/**
 * Validation schema for updating a material
 */
export const updateMaterialSchema = Joi.object({
  name: Joi.string().min(2).max(200).optional().messages({
    'string.min': 'Material name must be at least 2 characters',
    'string.max': 'Material name must not exceed 200 characters',
  }),
  description: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),
  category: Joi.string().max(100).optional().allow('').messages({
    'string.max': 'Category must not exceed 100 characters',
  }),
  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim()).max(10),
      Joi.string().trim()
    )
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 tags',
    }),
  isActive: Joi.boolean().optional(),
});

/**
 * Validation schema for material ID parameter
 */
export const materialIdParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Material ID is required',
    'any.required': 'Material ID is required',
  }),
});

/**
 * Validation schema for category parameter
 */
export const categoryParamSchema = Joi.object({
  category: Joi.string().required().messages({
    'string.empty': 'Category is required',
    'any.required': 'Category is required',
  }),
});

/**
 * Validation schema for pagination and filtering
 */
export const materialPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.min': 'Page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 100',
  }),
  sortBy: Joi.string()
    .valid('name', 'createdAt', 'updatedAt', 'downloadCount', 'fileSize', 'category')
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: name, createdAt, updatedAt, downloadCount, fileSize, category',
    }),
  order: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': 'Order must be either asc or desc',
  }),
});

/**
 * Validation schema for search query
 */
export const searchQuerySchema = Joi.object({
  q: Joi.string().min(1).optional().messages({
    'string.empty': 'Search query cannot be empty',
    'string.min': 'Search query must be at least 1 character',
  }),
  query: Joi.string().min(1).optional().messages({
    'string.empty': 'Search query cannot be empty',
    'string.min': 'Search query must be at least 1 character',
  }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid('name', 'createdAt', 'updatedAt', 'downloadCount', 'fileSize', 'category')
    .default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
}).or('q', 'query').messages({
  'object.missing': 'Either q or query parameter is required',
});

/**
 * Validation schema for tags query
 */
export const tagsQuerySchema = Joi.object({
  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim()).min(1).max(10),
      Joi.string().trim()
    )
    .required()
    .messages({
      'any.required': 'Tags parameter is required',
      'array.min': 'At least one tag is required',
      'array.max': 'Cannot query more than 10 tags at once',
    }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string()
    .valid('name', 'createdAt', 'updatedAt', 'downloadCount', 'fileSize', 'category')
    .default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});
