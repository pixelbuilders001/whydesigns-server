import Joi from 'joi';

// Create lead activity validation schema
export const createLeadActivitySchema = Joi.object({
  activityType: Joi.string()
    .valid('contacted', 'follow_up', 'meeting_scheduled', 'meeting_completed', 'interested', 'not_interested', 'converted', 'closed', 'other')
    .required()
    .messages({
      'any.required': 'Activity type is required',
      'any.only': 'Invalid activity type',
    }),
  remarks: Joi.string()
    .min(5)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Remarks must be at least 5 characters',
      'string.max': 'Remarks cannot exceed 2000 characters',
      'any.required': 'Remarks are required',
    }),
  activityDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Activity date must be a valid date',
    }),
  nextFollowUpDate: Joi.date()
    .optional()
    .allow(null)
    .messages({
      'date.base': 'Next follow-up date must be a valid date',
    }),
});

// Update lead activity validation schema
export const updateLeadActivitySchema = Joi.object({
  activityType: Joi.string()
    .valid('contacted', 'follow_up', 'meeting_scheduled', 'meeting_completed', 'interested', 'not_interested', 'converted', 'closed', 'other')
    .optional()
    .messages({
      'any.only': 'Invalid activity type',
    }),
  remarks: Joi.string()
    .min(5)
    .max(2000)
    .optional()
    .messages({
      'string.min': 'Remarks must be at least 5 characters',
      'string.max': 'Remarks cannot exceed 2000 characters',
    }),
  activityDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Activity date must be a valid date',
    }),
  nextFollowUpDate: Joi.date()
    .optional()
    .allow(null)
    .messages({
      'date.base': 'Next follow-up date must be a valid date',
    }),
}).min(1);

// Query parameters validation
export const getActivitiesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sortBy: Joi.string()
    .valid('activityDate', 'createdAt', 'updatedAt', 'activityType')
    .optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
});

// Param validation
export const leadIdParamSchema = Joi.object({
  leadId: Joi.string().required().messages({
    'any.required': 'Lead ID is required',
    'string.empty': 'Lead ID cannot be empty',
  }),
});

export const activityIdParamSchema = Joi.object({
  activityId: Joi.string().required().messages({
    'any.required': 'Activity ID is required',
    'string.empty': 'Activity ID cannot be empty',
  }),
});

export const leadActivityParamsSchema = Joi.object({
  leadId: Joi.string().required().messages({
    'any.required': 'Lead ID is required',
    'string.empty': 'Lead ID cannot be empty',
  }),
  activityId: Joi.string().required().messages({
    'any.required': 'Activity ID is required',
    'string.empty': 'Activity ID cannot be empty',
  }),
});
