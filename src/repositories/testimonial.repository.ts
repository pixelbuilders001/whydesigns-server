import { ITestimonial } from '../models/testimonial.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { createBaseFields } from '../models/base.model';

export interface TestimonialFilters {
  isActive?: boolean;
  isPublished?: boolean;
  isFavorite?: boolean;
  rating?: number;
  city?: string;
  state?: string;
  userId?: string;
  search?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class TestimonialRepository extends BaseRepository<ITestimonial> {
  constructor() {
    super(TABLES.TESTIMONIALS);
  }

  /**
   * Create a new testimonial
   */
  async create(testimonialData: Partial<ITestimonial>): Promise<ITestimonial> {
    const id = this.generateId();

    const testimonial: ITestimonial = {
      id,
      userId: testimonialData.userId,
      name: testimonialData.name || '',
      email: testimonialData.email || '',
      message: testimonialData.message || '',
      rating: testimonialData.rating || 5,
      city: testimonialData.city,
      state: testimonialData.state,
      country: testimonialData.country,
      designation: testimonialData.designation,
      company: testimonialData.company,
      profileImage: testimonialData.profileImage,
      isPublished: testimonialData.isPublished || false,
      isFavorite: testimonialData.isFavorite || false,
      displayOrder: testimonialData.displayOrder || 0,
      publishedAt: testimonialData.publishedAt,
      socialMedia: testimonialData.socialMedia,
      ...createBaseFields(),
    };

    return await this.putItem(testimonial);
  }

  /**
   * Find testimonial by ID
   */
  async findById(id: string): Promise<ITestimonial | null> {
    return await this.getItem({ id: id });
  }

  /**
   * Find all testimonials with filters and pagination
   */
  async findAll(
    filters: TestimonialFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

    // Build filter expression
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (filters.isActive !== undefined) {
      filterExpressions.push('#isActive = :isActive');
      expressionAttributeNames['#isActive'] = 'isActive';
      expressionAttributeValues[':isActive'] = filters.isActive;
    }

    if (filters.isPublished !== undefined) {
      filterExpressions.push('#isPublished = :isPublished');
      expressionAttributeNames['#isPublished'] = 'isPublished';
      expressionAttributeValues[':isPublished'] = filters.isPublished;
    }

    if (filters.isFavorite !== undefined) {
      filterExpressions.push('#isFavorite = :isFavorite');
      expressionAttributeNames['#isFavorite'] = 'isFavorite';
      expressionAttributeValues[':isFavorite'] = filters.isFavorite;
    }

    if (filters.rating) {
      filterExpressions.push('#rating = :rating');
      expressionAttributeNames['#rating'] = 'rating';
      expressionAttributeValues[':rating'] = filters.rating;
    }

    if (filters.userId) {
      filterExpressions.push('#userId = :userId');
      expressionAttributeNames['#userId'] = 'userId';
      expressionAttributeValues[':userId'] = filters.userId;
    }

    // Scan with filters
    const result = await this.scanItems({
      filterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      expressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      expressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
    });

    let testimonials = result.items;

    // Filter by city/state/search in memory
    if (filters.city) {
      const cityLower = filters.city.toLowerCase();
      testimonials = testimonials.filter(t => t.city?.toLowerCase().includes(cityLower));
    }

    if (filters.state) {
      const stateLower = filters.state.toLowerCase();
      testimonials = testimonials.filter(t => t.state?.toLowerCase().includes(stateLower));
    }

    if (filters.search) {
      const queryLower = filters.search.toLowerCase();
      testimonials = testimonials.filter(t =>
        t.name?.toLowerCase().includes(queryLower) ||
        t.message?.toLowerCase().includes(queryLower) ||
        t.email?.toLowerCase().includes(queryLower)
      );
    }

    // Sort in memory
    const sortedTestimonials = this.sortItems(testimonials, sortBy, sortOrder);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedTestimonials = sortedTestimonials.slice(skip, skip + limit);

    return {
      testimonials: paginatedTestimonials,
      total: sortedTestimonials.length,
      page,
      totalPages: Math.ceil(sortedTestimonials.length / limit),
    };
  }

  /**
   * Find published testimonials (public)
   */
  async findPublished(
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    return this.findAll(
      { isActive: true, isPublished: true },
      options
    );
  }

  /**
   * Find favorite testimonials
   */
  async findFavorites(
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    return this.findAll(
      { isActive: true, isPublished: true, isFavorite: true },
      { ...options, sortBy: 'displayOrder' }
    );
  }

  /**
   * Find testimonials by user
   */
  async findByUserId(userId: string): Promise<ITestimonial[]> {
    const result = await this.scanItems({
      filterExpression: '#userId = :userId AND #isActive = :isActive',
      expressionAttributeNames: { '#userId': 'userId', '#isActive': 'isActive' },
      expressionAttributeValues: { ':userId': userId, ':isActive': true },
    });

    return this.sortItems(result.items, 'createdAt', 'desc');
  }

  /**
   * Find testimonials by rating
   */
  async findByRating(
    rating: number,
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    return this.findAll(
      { isActive: true, isPublished: true, rating },
      options
    );
  }

  /**
   * Find testimonials by location
   */
  async findByLocation(
    city?: string,
    state?: string,
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    const filters: TestimonialFilters = { isActive: true, isPublished: true };
    if (city) filters.city = city;
    if (state) filters.state = state;
    return this.findAll(filters, options);
  }

  /**
   * Update testimonial
   */
  async update(id: string, updateData: Partial<ITestimonial>): Promise<ITestimonial | null> {
    return await this.updateItem({ id: id }, updateData);
  }

  /**
   * Delete testimonial (hard delete)
   */
  async delete(id: string): Promise<ITestimonial | null> {
    const testimonial = await this.findById(id);
    await this.hardDeleteItem({ id: id });
    return testimonial;
  }

  /**
   * Soft delete testimonial (deactivate)
   */
  async softDelete(id: string): Promise<ITestimonial | null> {
    return await this.softDeleteItem({ id: id });
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string): Promise<ITestimonial | null> {
    const testimonial = await this.findById(id);
    if (!testimonial) return null;

    return await this.update(id, { isFavorite: !testimonial.isFavorite });
  }

  /**
   * Publish testimonial
   */
  async publish(id: string): Promise<ITestimonial | null> {
    return await this.update(id, { isPublished: true, publishedAt: new Date().toISOString() });
  }

  /**
   * Unpublish testimonial
   */
  async unpublish(id: string): Promise<ITestimonial | null> {
    return await this.update(id, { isPublished: false });
  }

  /**
   * Get testimonial statistics
   */
  async getStats(): Promise<any> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    const total = result.items.length;
    const published = result.items.filter(t => t.isPublished).length;
    const unpublished = result.items.filter(t => !t.isPublished).length;
    const favorites = result.items.filter(t => t.isFavorite).length;

    // Rating distribution
    const ratingStats = result.items
      .filter(t => t.isPublished)
      .reduce((acc: any, t) => {
        const rating = t.rating || 5;
        if (!acc[rating]) acc[rating] = { id: rating, count: 0 };
        acc[rating].count++;
        return acc;
      }, {});

    const ratingDistribution = Object.values(ratingStats).sort((a: any, b: any) => b.id - a.id);

    const publishedTestimonials = result.items.filter(t => t.isPublished);
    const avgRating = publishedTestimonials.length > 0
      ? (publishedTestimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / publishedTestimonials.length).toFixed(2)
      : 0;

    return {
      total,
      published,
      unpublished,
      favorites,
      averageRating: avgRating,
      ratingDistribution,
    };
  }

  /**
   * Check if testimonial exists by user and message
   */
  async existsByUserAndMessage(userId: string, message: string): Promise<boolean> {
    const result = await this.scanItems({
      filterExpression: '#userId = :userId AND #message = :message AND #isActive = :isActive',
      expressionAttributeNames: { '#userId': 'userId', '#message': 'message', '#isActive': 'isActive' },
      expressionAttributeValues: { ':userId': userId, ':message': message, ':isActive': true },
    });

    return result.items.length > 0;
  }

  /**
   * Helper method to sort items in memory
   */
  private sortItems(items: ITestimonial[], sortBy: string, sortOrder: string): ITestimonial[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new TestimonialRepository();
