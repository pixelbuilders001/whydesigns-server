import Joi from 'joi';

export const createTeamSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  designation: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Designation is required',
    'string.min': 'Designation must be at least 2 characters long',
    'string.max': 'Designation cannot exceed 100 characters',
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot exceed 1000 characters',
  }),
  isPublished: Joi.boolean().optional(),
  displayOrder: Joi.number().min(0).optional().messages({
    'number.min': 'Display order cannot be negative',
  }),
});

export const updateTeamSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
  }),
  designation: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Designation must be at least 2 characters long',
    'string.max': 'Designation cannot exceed 100 characters',
  }),
  description: Joi.string().min(10).max(1000).optional().messages({
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot exceed 1000 characters',
  }),
  isPublished: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  displayOrder: Joi.number().min(0).optional().messages({
    'number.min': 'Display order cannot be negative',
  }),
}).min(1);

export const getTeamMembersQuerySchema = Joi.object({
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
    .valid('createdAt', 'publishedAt', 'displayOrder', 'name')
    .optional()
    .default('displayOrder')
    .messages({
      'any.only': 'Sort by must be one of: createdAt, publishedAt, displayOrder, name',
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('asc').messages({
    'any.only': 'Sort order must be either asc or desc',
  }),
  isPublished: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  search: Joi.string().optional(),
});

export const teamIdParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid team member ID format',
      'any.required': 'Team member ID is required',
    }),
});
