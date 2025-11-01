import { ICategory } from '../models/category.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { PaginationOptions } from '../types';
import { createBaseFields } from '../models/base.model';

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super(TABLES.CATEGORIES);
  }

  async create(categoryData: Partial<ICategory>): Promise<ICategory> {
    const _id = this.generateId();

    const category: ICategory = {
      _id,
      name: categoryData.name || '',
      slug: categoryData.slug || '',
      description: categoryData.description || '',
      createdBy: categoryData.createdBy || '',
      ...createBaseFields(),
    };

    return await this.putItem(category);
  }

  async findById(id: string): Promise<ICategory | null> {
    return await this.getItem({ _id: id });
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    const result = await this.scanItems({
      filterExpression: '#slug = :slug AND #isActive = :isActive',
      expressionAttributeNames: { '#slug': 'slug', '#isActive': 'isActive' },
      expressionAttributeValues: { ':slug': slug, ':isActive': true },
      limit: 1,
    });

    return result.items[0] || null;
  }

  async findByName(name: string): Promise<ICategory | null> {
    const result = await this.scanItems({
      filterExpression: '#name = :name AND #isActive = :isActive',
      expressionAttributeNames: { '#name': 'name', '#isActive': 'isActive' },
      expressionAttributeValues: { ':name': name, ':isActive': true },
    });

    return result.items[0] || null;
  }

  async findAll(options: PaginationOptions): Promise<{ categories: ICategory[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    // Scan only active categories
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    // Sort in memory
    const sortedCategories = this.sortItems(result.items, sortBy, order);

    // Paginate in memory
    const skip = (page - 1) * limit;
    const paginatedCategories = sortedCategories.slice(skip, skip + limit);

    return { categories: paginatedCategories, total: sortedCategories.length };
  }

  async findAllWithInactive(options: PaginationOptions): Promise<{ categories: ICategory[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    // Scan all categories (active and inactive)
    const result = await this.scanItems({});

    // Sort in memory
    const sortedCategories = this.sortItems(result.items, sortBy, order);

    // Paginate in memory
    const skip = (page - 1) * limit;
    const paginatedCategories = sortedCategories.slice(skip, skip + limit);

    return { categories: paginatedCategories, total: sortedCategories.length };
  }

  async update(id: string, updateData: Partial<ICategory>): Promise<ICategory | null> {
    return await this.updateItem({ _id: id }, updateData);
  }

  async delete(id: string): Promise<ICategory | null> {
    const category = await this.findById(id);
    await this.hardDeleteItem({ _id: id });
    return category;
  }

  async softDelete(id: string): Promise<ICategory | null> {
    return await this.softDeleteItem({ _id: id });
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const result = await this.scanItems({
      filterExpression: '#name = :name',
      expressionAttributeNames: { '#name': 'name' },
      expressionAttributeValues: { ':name': name },
    });

    if (excludeId) {
      return result.items.some(cat => cat._id !== excludeId);
    }

    return result.items.length > 0;
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const result = await this.scanItems({
      filterExpression: '#slug = :slug',
      expressionAttributeNames: { '#slug': 'slug' },
      expressionAttributeValues: { ':slug': slug },
      limit: 2,
    });

    if (excludeId) {
      return result.items.some(cat => cat._id !== excludeId);
    }

    return result.items.length > 0;
  }

  async countActive(): Promise<number> {
    return await this.countItems(
      '#isActive = :isActive',
      { '#isActive': 'isActive' },
      { ':isActive': true }
    );
  }

  async countInactive(): Promise<number> {
    return await this.countItems(
      '#isActive = :isActive',
      { '#isActive': 'isActive' },
      { ':isActive': false }
    );
  }

  async search(query: string, options: PaginationOptions): Promise<{ categories: ICategory[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    // Scan active categories
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    // Filter in memory
    const queryLower = query.toLowerCase();
    const filteredCategories = result.items.filter((category) => {
      return (
        category.name?.toLowerCase().includes(queryLower) ||
        category.description?.toLowerCase().includes(queryLower)
      );
    });

    // Sort
    const sortedCategories = this.sortItems(filteredCategories, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedCategories = sortedCategories.slice(skip, skip + limit);

    return { categories: paginatedCategories, total: filteredCategories.length };
  }

  async getStats(): Promise<any> {
    const allCategories = await this.scanItems({});

    const total = allCategories.items.length;
    const active = await this.countActive();
    const inactive = await this.countInactive();

    return {
      total,
      active,
      inactive,
    };
  }

  /**
   * Helper method to sort items in memory
   */
  private sortItems(items: ICategory[], sortBy: string, order: string): ICategory[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new CategoryRepository();
