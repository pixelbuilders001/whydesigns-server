import Joi from 'joi';

export const createLeadSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Full name is required',
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name cannot exceed 100 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),
  phone: Joi.string()
    .pattern(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please provide a valid phone number',
    }),
  areaOfInterest: Joi.string().max(200).required().messages({
    'string.empty': 'Area of interest is required',
    'string.max': 'Area of interest cannot exceed 200 characters',
  }),
  message: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Message cannot exceed 1000 characters',
  }),
});

export const updateLeadSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Full name must be at least 2 characters long',
    'string.max': 'Full name cannot exceed 100 characters',
  }),
  email: Joi.string().email().optional().messages({
    'string.email': 'Please provide a valid email address',
  }),
  phone: Joi.string()
    .pattern(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),
  areaOfInterest: Joi.string().max(200).optional().messages({
    'string.max': 'Area of interest cannot exceed 200 characters',
  }),
  message: Joi.string().max(1000).optional().allow('').messages({
    'string.max': 'Message cannot exceed 1000 characters',
  }),
  contacted: Joi.boolean().optional().messages({
    'boolean.base': 'contacted must be a boolean',
  }),
  isActive: Joi.boolean().optional().messages({
    'boolean.base': 'isActive must be a boolean',
  }),
}).min(1);

export const updateActiveStatusSchema = Joi.object({
  isActive: Joi.boolean().required().messages({
    'boolean.base': 'isActive must be a boolean',
    'any.required': 'isActive is required',
  }),
});

export const getLeadsQuerySchema = Joi.object({
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
    .valid('createdAt', 'fullName', 'email', 'areaOfInterest', 'contactedAt', 'contacted')
    .optional()
    .default('createdAt')
    .messages({
      'any.only': 'Sort by must be one of: createdAt, fullName, email, areaOfInterest, contactedAt, contacted',
    }),
  sortOrder: Joi.string().valid('asc', 'desc').optional().default('desc').messages({
    'any.only': 'Sort order must be either asc or desc',
  }),
  isActive: Joi.boolean().optional(),
  contacted: Joi.boolean().optional(),
  areaOfInterest: Joi.string().optional(),
  search: Joi.string().optional(),
});

export const leadIdParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Invalid lead ID format',
      'any.required': 'Lead ID is required',
    }),
});
