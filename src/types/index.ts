import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role?: string;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  order: 'asc' | 'desc';
}

export interface MongoDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
