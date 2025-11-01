import { IMaterial } from '../models/material.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { PaginationOptions } from '../types';
import { createBaseFields } from '../models/base.model';

/**
 * Material Repository
 * Handles all database operations for materials
 */
export class MaterialRepository extends BaseRepository<IMaterial> {
  constructor() {
    super(TABLES.MATERIALS);
  }

  /**
   * Create a new material
   */
  async create(data: Partial<IMaterial>): Promise<IMaterial> {
    const id = this.generateId();

    const material: IMaterial = {
      id,
      name: data.name || '',
      description: data.description || '',
      fileUrl: data.fileUrl || '',
      fileType: data.fileType || '',
      fileSize: data.fileSize || 0,
      category: data.category || '',
      uploadedBy: data.uploadedBy || '',
      downloadCount: data.downloadCount || 0,
      isPublished: data.isPublished || false,
      publishedAt: data.publishedAt || null,
      ...createBaseFields(),
    };

    return await this.putItem(material);
  }

  /**
   * Find material by ID
   */
  async findById(id: string): Promise<IMaterial | null> {
    return await this.getItem({ id: id });
  }

  /**
   * Find all materials with pagination
   */
  async findAll(options: PaginationOptions, filters: { isActive?: boolean } = {}): Promise<{ items: IMaterial[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    // Build filter
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (filters.isActive !== undefined) {
      filterExpressions.push('#isActive = :isActive');
      expressionAttributeNames['#isActive'] = 'isActive';
      expressionAttributeValues[':isActive'] = filters.isActive;
    }

    const result = await this.scanItems({
      filterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      expressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      expressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
    });

    // Sort in memory
    const sortedItems = this.sortItems(result.items, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedItems = sortedItems.slice(skip, skip + limit);

    return { items: paginatedItems, total: sortedItems.length };
  }

  /**
   * Find materials by category
   */
  async findByCategory(
    category: string,
    options: PaginationOptions
  ): Promise<{ items: IMaterial[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    const result = await this.scanItems({
      filterExpression: '#category = :category AND #isActive = :isActive',
      expressionAttributeNames: { '#category': 'category', '#isActive': 'isActive' },
      expressionAttributeValues: { ':category': category, ':isActive': true },
    });

    // Sort in memory
    const sortedItems = this.sortItems(result.items, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedItems = sortedItems.slice(skip, skip + limit);

    return { items: paginatedItems, total: sortedItems.length };
  }

  /**
   * Find materials by tags
   */
  async findByTags(
    tags: string[],
    options: PaginationOptions
  ): Promise<{ items: IMaterial[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    // Filter by tags in memory (category field)
    const filteredItems = result.items.filter(material =>
      material.category && tags.some(tag => material.category?.includes(tag))
    );

    // Sort in memory
    const sortedItems = this.sortItems(filteredItems, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedItems = sortedItems.slice(skip, skip + limit);

    return { items: paginatedItems, total: sortedItems.length };
  }

  /**
   * Search materials by query
   */
  async search(
    query: string,
    options: PaginationOptions
  ): Promise<{ items: IMaterial[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    // Filter in memory
    const queryLower = query.toLowerCase();
    const filteredItems = result.items.filter((material) => {
      return (
        material.name?.toLowerCase().includes(queryLower) ||
        material.description?.toLowerCase().includes(queryLower) ||
        material.category?.toLowerCase().includes(queryLower)
      );
    });

    // Sort in memory
    const sortedItems = this.sortItems(filteredItems, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedItems = sortedItems.slice(skip, skip + limit);

    return { items: paginatedItems, total: filteredItems.length };
  }

  /**
   * Update material by ID
   */
  async update(id: string, data: Partial<IMaterial>): Promise<IMaterial | null> {
    return await this.updateItem({ id: id }, data);
  }

  /**
   * Delete material by ID (hard delete)
   */
  async delete(id: string): Promise<IMaterial | null> {
    const material = await this.findById(id);
    await this.hardDeleteItem({ id: id });
    return material;
  }

  /**
   * Soft delete material by ID
   */
  async softDelete(id: string): Promise<IMaterial | null> {
    return await this.softDeleteItem({ id: id });
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(id: string): Promise<IMaterial | null> {
    const material = await this.findById(id);
    if (material) {
      return await this.updateItem({ id: id }, { downloadCount: (material.downloadCount || 0) + 1 });
    }
    return null;
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    const categoriesSet = new Set<string>();
    result.items.forEach(material => {
      if (material.category) categoriesSet.add(material.category);
    });

    return Array.from(categoriesSet).sort();
  }

  /**
   * Get all unique tags
   */
  async getTags(): Promise<string[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    const tagsSet = new Set<string>();
    result.items.forEach(material => {
      if (material.category) {
        tagsSet.add(material.category);
      }
    });

    return Array.from(tagsSet).sort();
  }

  /**
   * Get material count by category
   */
  async getCountByCategory(): Promise<{ category: string; count: number }[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    // Count by category in memory
    const categoryCount = result.items.reduce((acc: Record<string, number>, material) => {
      const category = material.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Publish material
   */
  async publish(id: string): Promise<IMaterial | null> {
    return await this.update(id, { isPublished: true, publishedAt: new Date().toISOString() });
  }

  /**
   * Unpublish material
   */
  async unpublish(id: string): Promise<IMaterial | null> {
    return await this.update(id, { isPublished: false });
  }

  /**
   * Get material statistics
   */
  async getStats(): Promise<any> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    const total = result.items.length;
    const published = result.items.filter(m => m.isPublished).length;
    const unpublished = result.items.filter(m => !m.isPublished).length;
    const totalDownloads = result.items.reduce((sum, m) => sum + (m.downloadCount || 0), 0);
    const categories = await this.getCountByCategory();

    return {
      total,
      published,
      unpublished,
      totalDownloads,
      categories,
    };
  }

  /**
   * Helper method to sort items in memory
   */
  private sortItems(items: IMaterial[], sortBy: string, order: string): IMaterial[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new MaterialRepository();
