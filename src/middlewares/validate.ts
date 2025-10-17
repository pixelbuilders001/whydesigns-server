import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../utils/AppError';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ensure req.body is an object (handle undefined/null cases)
    const bodyToValidate = req.body || {};

    const { error, value } = schema.validate(bodyToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');

      throw new ValidationError(errorMessage);
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');

      throw new ValidationError(errorMessage);
    }

    // Clear existing query params and assign validated values
    Object.keys(req.query).forEach(key => delete (req.query as any)[key]);
    Object.assign(req.query, value);
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');

      throw new ValidationError(errorMessage);
    }

    // Clear existing params and assign validated values
    Object.keys(req.params).forEach(key => delete (req.params as any)[key]);
    Object.assign(req.params, value);
    next();
  };
};
