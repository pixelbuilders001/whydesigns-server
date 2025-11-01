import categoryRepository from '../repositories/category.repository';
import { ICategory } from '../models/category.model';
import { PaginationOptions } from '../types';
import { NotFoundError, BadRequestError, ConflictError } from '../utils/AppError';

interface CreateCategoryData {
  name: string;
  slug?: string;
  description?: string;
  createdBy: string;
}

interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export class CategoryService {
  async createCategory(data: CreateCategoryData): Promise<ICategory> {
    const { name, slug, description, createdBy } = data;

    // Check if category name already exists
    const existingCategory = await categoryRepository.existsByName(name);
    if (existingCategory) {
      throw new ConflictError('Category name already exists');
    }

    // Generate slug from name if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingSlug = await categoryRepository.existsBySlug(categorySlug);
    if (existingSlug) {
      throw new ConflictError('Category slug already exists');
    }

    // Create category
    const category = await categoryRepository.create({
      name,
      slug: categorySlug,
      description: description || '',
      createdBy: createdBy as any,
    });

    return category;
  }

  async getAllCategories(options: PaginationOptions, includeInactive = false): Promise<{ categories: ICategory[]; total: number }> {
    if (includeInactive) {
      return await categoryRepository.findAllWithInactive(options);
    }
    return await categoryRepository.findAll(options);
  }

  async getCategoryById(id: string): Promise<ICategory> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<ICategory> {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async updateCategory(id: string, data: UpdateCategoryData): Promise<ICategory> {
    const { name, slug, description, isActive } = data;

    // Check if category exists
    const existingCategory = await categoryRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundError('Category not found');
    }

    // Check if name is being updated and if it already exists
    if (name && name !== existingCategory.name) {
      const nameExists = await categoryRepository.existsByName(name, id);
      if (nameExists) {
        throw new ConflictError('Category name already exists');
      }
    }

    // Check if slug is being updated and if it already exists
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await categoryRepository.existsBySlug(slug, id);
      if (slugExists) {
        throw new ConflictError('Category slug already exists');
      }
    }

    // Update category
    const updateData: Partial<ICategory> = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCategory = await categoryRepository.update(id, updateData);
    if (!updatedCategory) {
      throw new NotFoundError('Category not found');
    }

    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // TODO: Check if category has any blogs associated with it
    // For now, we'll just delete the category
    await categoryRepository.delete(id);
  }

  async softDeleteCategory(id: string): Promise<ICategory> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const deletedCategory = await categoryRepository.softDelete(id);
    if (!deletedCategory) {
      throw new NotFoundError('Category not found');
    }

    return deletedCategory;
  }

  async searchCategories(query: string, options: PaginationOptions): Promise<{ categories: ICategory[]; total: number }> {
    if (!query || query.trim() === '') {
      throw new BadRequestError('Search query is required');
    }
    return await categoryRepository.search(query, options);
  }

  async getCategoryStats(): Promise<{ total: number; active: number; inactive: number }> {
    const [active, inactive] = await Promise.all([
      categoryRepository.countActive(),
      categoryRepository.countInactive(),
    ]);

    return {
      total: active + inactive,
      active,
      inactive,
    };
  }
}

export default new CategoryService();
