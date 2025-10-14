import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.config';
import { UnauthorizedError, ForbiddenError } from '../utils/AppError';
import { AuthenticatedRequest } from '../types';
import userRepository from '../repositories/user.repository';
import { IRole } from '../models/role.model';

interface JwtPayload {
  id: string;
  email: string;
  roleId: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    // Fetch user with role to get the latest role information
    const user = await userRepository.findByIdWithRole(decoded.id);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: (user.roleId as any as IRole)?.name || '',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

export const requireVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Fetch user to check verification status
    const user = await userRepository.findById(req.user.id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // User must have either email OR phone verified
    if (!user.isEmailVerified && !user.isPhoneVerified) {
      throw new ForbiddenError('Please verify your email or phone number to access this resource');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    // If no token provided, just continue without setting req.user
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    // Fetch user with role to get the latest role information
    const user = await userRepository.findByIdWithRole(decoded.id);

    if (user && user.isActive) {
      req.user = {
        id: user._id,
        email: user.email,
        role: (user.roleId as any as IRole)?.name || '',
      };
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without setting req.user
    // This allows the endpoint to work for both authenticated and public users
    next();
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    if (!roles.includes(req.user.role || '')) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};
