import { BaseModel } from './base.model';

export interface IRole extends BaseModel {
  _id: string; // UUID - Primary Key
  name: 'USER' | 'ADMIN';
  description: string;
  permissions: string[];
}

export interface CreateRoleInput {
  name: 'USER' | 'ADMIN';
  description: string;
  permissions?: string[];
}

export interface UpdateRoleInput {
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}
