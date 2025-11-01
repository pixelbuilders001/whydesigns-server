import { BaseModel } from './base.model';

export interface ICategory extends BaseModel {
  id: string; // UUID - Primary Key
  name: string;
  slug: string;
  description: string;
  createdBy: string; // User ID
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  createdBy: string;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

// Utility class
export class CategoryUtils {
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export default ICategory;
