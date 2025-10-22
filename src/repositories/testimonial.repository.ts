import Testimonial, { ITestimonial } from '../models/testimonial.model';
import mongoose from 'mongoose';

export interface TestimonialFilters {
  isActive?: boolean;
  isApproved?: boolean;
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

class TestimonialRepository {
  /**
   * Create a new testimonial
   */
  async create(testimonialData: Partial<ITestimonial>): Promise<ITestimonial> {
    const testimonial = await Testimonial.create(testimonialData);
    return testimonial;
  }

  /**
   * Find testimonial by ID
   */
  async findById(id: string): Promise<ITestimonial | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Testimonial.findOne({ _id: id, isActive: true });
  }

  /**
   * Find all testimonials with filters and pagination
   */
  async findAll(
    filters: TestimonialFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.isApproved !== undefined) {
      query.isApproved = filters.isApproved;
    }

    if (filters.isFavorite !== undefined) {
      query.isFavorite = filters.isFavorite;
    }

    if (filters.rating) {
      query.rating = filters.rating;
    }

    if (filters.city) {
      query.city = new RegExp(filters.city, 'i');
    }

    if (filters.state) {
      query.state = new RegExp(filters.state, 'i');
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Execute query
    const [testimonials, total] = await Promise.all([
      Testimonial.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit),
      Testimonial.countDocuments(query),
    ]);

    return {
      testimonials,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find approved testimonials (public)
   */
  async findApproved(
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    return this.findAll(
      { isActive: true, isApproved: true },
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
      { isActive: true, isApproved: true, isFavorite: true },
      { ...options, sortBy: 'displayOrder' }
    );
  }

  /**
   * Find testimonials by user
   */
  async findByUserId(userId: string): Promise<ITestimonial[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }
    return await Testimonial.find({ userId, isActive: true }).sort({ createdAt: -1 });
  }

  /**
   * Find testimonials by rating
   */
  async findByRating(
    rating: number,
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    return this.findAll(
      { isActive: true, isApproved: true, rating },
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
    const filters: TestimonialFilters = { isActive: true, isApproved: true };
    if (city) filters.city = city;
    if (state) filters.state = state;
    return this.findAll(filters, options);
  }

  /**
   * Update testimonial
   */
  async update(id: string, updateData: Partial<ITestimonial>): Promise<ITestimonial | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Testimonial.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  /**
   * Delete testimonial (soft delete)
   */
  async softDelete(id: string): Promise<ITestimonial | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Testimonial.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Delete testimonial (soft delete)
   */
  async delete(id: string): Promise<ITestimonial | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Testimonial.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  /**
   * Hard delete testimonial
   */
  async hardDelete(id: string): Promise<ITestimonial | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Testimonial.findByIdAndDelete(id);
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id: string): Promise<ITestimonial | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const testimonial = await this.findById(id);
    if (!testimonial) return null;

    return await this.update(id, { isFavorite: !testimonial.isFavorite });
  }

  /**
   * Approve testimonial
   */
  async approve(id: string): Promise<ITestimonial | null> {
    return await this.update(id, { isApproved: true });
  }

  /**
   * Reject testimonial
   */
  async reject(id: string): Promise<ITestimonial | null> {
    return await this.update(id, { isApproved: false });
  }

  /**
   * Get testimonial statistics
   */
  async getStats(): Promise<any> {
    const [total, approved, pending, favorites, ratingStats] = await Promise.all([
      Testimonial.countDocuments({ isActive: true }),
      Testimonial.countDocuments({ isActive: true, isApproved: true }),
      Testimonial.countDocuments({ isActive: true, isApproved: false }),
      Testimonial.countDocuments({ isActive: true, isFavorite: true }),
      Testimonial.aggregate([
        { $match: { isActive: true, isApproved: true } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]),
    ]);

    const avgRating = await Testimonial.aggregate([
      { $match: { isActive: true, isApproved: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
        },
      },
    ]);

    return {
      total,
      approved,
      pending,
      favorites,
      averageRating: avgRating.length > 0 ? avgRating[0].averageRating.toFixed(2) : 0,
      ratingDistribution: ratingStats,
    };
  }

  /**
   * Check if testimonial exists by user and message
   */
  async existsByUserAndMessage(userId: string, message: string): Promise<boolean> {
    const count = await Testimonial.countDocuments({
      userId,
      message,
      isActive: true,
    });
    return count > 0;
  }
}

export default new TestimonialRepository();
