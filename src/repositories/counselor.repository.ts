import { ICounselor } from '../models/counselor.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { PaginationOptions } from '../types';
import { createBaseFields } from '../models/base.model';

export class CounselorRepository extends BaseRepository<ICounselor> {
  constructor() {
    super(TABLES.COUNSELORS);
  }

  async create(counselorData: Partial<ICounselor>): Promise<ICounselor> {
    const id = this.generateId();

    const counselor: ICounselor = {
      id,
      fullName: counselorData.fullName || '',
      email: counselorData.email || '',
      title: counselorData.title || '',
      bio: counselorData.bio || '',
      avatarUrl: counselorData.avatarUrl || '',
      specialties: counselorData.specialties || [],
      rating: counselorData.rating || 0,
      yearsOfExperience: counselorData.yearsOfExperience || 0,
      ...createBaseFields(),
    };

    return await this.putItem(counselor);
  }

  async findById(id: string): Promise<ICounselor | null> {
    return await this.getItem({ id: id });
  }

  async findAll(options: PaginationOptions, filters: { isActive?: boolean } = {}): Promise<{ counselors: ICounselor[]; total: number }> {
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
    const sortedCounselors = this.sortItems(result.items, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedCounselors = sortedCounselors.slice(skip, skip + limit);

    return { counselors: paginatedCounselors, total: sortedCounselors.length };
  }

  async update(id: string, updateData: Partial<ICounselor>): Promise<ICounselor | null> {
    return await this.updateItem({ id: id }, updateData);
  }

  async hardDelete(id: string): Promise<ICounselor | null> {
    const counselor = await this.findById(id);
    await this.hardDeleteItem({ id: id });
    return counselor;
  }

  async softDelete(id: string): Promise<ICounselor | null> {
    return await this.softDeleteItem({ id: id });
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

  async search(query: string, options: PaginationOptions): Promise<{ counselors: ICounselor[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    // Filter in memory
    const queryLower = query.toLowerCase();
    const filteredCounselors = result.items.filter((counselor) => {
      return (
        counselor.fullName?.toLowerCase().includes(queryLower) ||
        counselor.title?.toLowerCase().includes(queryLower) ||
        counselor.bio?.toLowerCase().includes(queryLower) ||
        counselor.specialties?.some(s => s.toLowerCase().includes(queryLower))
      );
    });

    // Sort
    const sortedCounselors = this.sortItems(filteredCounselors, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedCounselors = sortedCounselors.slice(skip, skip + limit);

    return { counselors: paginatedCounselors, total: filteredCounselors.length };
  }

  async findBySpecialty(specialty: string, options: PaginationOptions): Promise<{ counselors: ICounselor[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    // Filter by specialty in memory
    const specialtyLower = specialty.toLowerCase();
    const filteredCounselors = result.items.filter(counselor =>
      counselor.specialties?.some(s => s.toLowerCase().includes(specialtyLower))
    );

    // Sort
    const sortedCounselors = this.sortItems(filteredCounselors, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedCounselors = sortedCounselors.slice(skip, skip + limit);

    return { counselors: paginatedCounselors, total: filteredCounselors.length };
  }

  async findTopRated(limit: number = 10): Promise<ICounselor[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    const sorted = this.sortItems(result.items, 'rating', 'desc');
    return sorted.slice(0, limit);
  }

  async findMostExperienced(limit: number = 10): Promise<ICounselor[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    const sorted = this.sortItems(result.items, 'yearsOfExperience', 'desc');
    return sorted.slice(0, limit);
  }

  async getAverageRating(): Promise<number> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    if (result.items.length === 0) return 0;

    const totalRating = result.items.reduce((sum, counselor) => sum + (counselor.rating || 0), 0);
    return totalRating / result.items.length;
  }

  async countBySpecialty(specialty: string): Promise<number> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    const specialtyLower = specialty.toLowerCase();
    return result.items.filter(counselor =>
      counselor.specialties?.some(s => s.toLowerCase().includes(specialtyLower))
    ).length;
  }

  async getAllSpecialties(): Promise<string[]> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    const specialtiesSet = new Set<string>();
    result.items.forEach(counselor => {
      counselor.specialties?.forEach(specialty => specialtiesSet.add(specialty));
    });

    return Array.from(specialtiesSet).sort();
  }

  async getStats(): Promise<any> {
    const allCounselors = await this.scanItems({});

    const total = allCounselors.items.length;
    const active = await this.countActive();
    const inactive = await this.countInactive();
    const avgRating = await this.getAverageRating();

    return {
      total,
      active,
      inactive,
      averageRating: avgRating.toFixed(2),
    };
  }

  /**
   * Helper method to sort items in memory
   */
  private sortItems(items: ICounselor[], sortBy: string, order: string): ICounselor[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new CounselorRepository();
