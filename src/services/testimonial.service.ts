import testimonialRepository, { TestimonialFilters, PaginationOptions } from '../repositories/testimonial.repository';
import { ITestimonial } from '../models/testimonial.model';
import { AppError } from '../utils/AppError';

class TestimonialService {
  /**
   * Create a new testimonial
   */
  async createTestimonial(userId: string | null, testimonialData: Partial<ITestimonial>): Promise<ITestimonial> {
    // Check if authenticated user already submitted testimonial with same message
    if (userId && testimonialData.message) {
      const exists = await testimonialRepository.existsByUserAndMessage(userId, testimonialData.message);
      if (exists) {
        throw new AppError('You have already submitted this testimonial', 400);
      }
    }

    // Create testimonial (userId can be null for guest testimonials)
    const testimonial = await testimonialRepository.create({
      ...testimonialData,
      userId: userId as any,
    });

    return testimonial;
  }

  /**
   * Get all testimonials with filters
   */
  async getAllTestimonials(
    filters: TestimonialFilters = {},
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    return await testimonialRepository.findAll(filters, options);
  }

  /**
   * Get approved testimonials (public view)
   */
  async getApprovedTestimonials(
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    return await testimonialRepository.findApproved(options);
  }

  /**
   * Get favorite testimonials
   */
  async getFavoriteTestimonials(
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    return await testimonialRepository.findFavorites(options);
  }

  /**
   * Get testimonial by ID
   */
  async getTestimonialById(id: string): Promise<ITestimonial> {
    const testimonial = await testimonialRepository.findById(id);
    if (!testimonial) {
      throw new AppError('Testimonial not found', 404);
    }
    return testimonial;
  }

  /**
   * Get testimonials by user
   */
  async getTestimonialsByUser(userId: string): Promise<ITestimonial[]> {
    return await testimonialRepository.findByUserId(userId);
  }

  /**
   * Get testimonials by rating
   */
  async getTestimonialsByRating(
    rating: number,
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }
    return await testimonialRepository.findByRating(rating, options);
  }

  /**
   * Get testimonials by location
   */
  async getTestimonialsByLocation(
    city?: string,
    state?: string,
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    return await testimonialRepository.findByLocation(city, state, options);
  }

  /**
   * Update testimonial
   */
  async updateTestimonial(id: string, userId: string, updateData: Partial<ITestimonial>, isAdmin: boolean = false): Promise<ITestimonial> {
    const testimonial = await this.getTestimonialById(id);

    // Check ownership if not admin
    if (!isAdmin && testimonial.userId && testimonial.userId.toString() !== userId) {
      throw new AppError('You are not authorized to update this testimonial', 403);
    }

    // Don't allow user to change approval or favorite status (admin only)
    if (!isAdmin) {
      delete updateData.isApproved;
      delete updateData.isFavorite;
      delete updateData.displayOrder;
    }

    const updatedTestimonial = await testimonialRepository.update(id, updateData);
    if (!updatedTestimonial) {
      throw new AppError('Failed to update testimonial', 500);
    }

    return updatedTestimonial;
  }

  /**
   * Delete testimonial
   */
  async deleteTestimonial(id: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const testimonial = await this.getTestimonialById(id);

    // Check ownership if not admin
    if (!isAdmin && testimonial.userId && testimonial.userId.toString() !== userId) {
      throw new AppError('You are not authorized to delete this testimonial', 403);
    }

    await testimonialRepository.delete(id);
  }

  /**
   * Soft delete testimonial
   */
  async deactivateTestimonial(id: string, userId: string, isAdmin: boolean = false): Promise<ITestimonial> {
    const testimonial = await this.getTestimonialById(id);

    // Check ownership if not admin
    if (!isAdmin && testimonial.userId && testimonial.userId.toString() !== userId) {
      throw new AppError('You are not authorized to deactivate this testimonial', 403);
    }

    const deactivated = await testimonialRepository.softDelete(id);
    if (!deactivated) {
      throw new AppError('Failed to deactivate testimonial', 500);
    }

    return deactivated;
  }

  /**
   * Toggle favorite status (admin only)
   */
  async toggleFavorite(id: string): Promise<ITestimonial> {
    const testimonial = await testimonialRepository.toggleFavorite(id);
    if (!testimonial) {
      throw new AppError('Testimonial not found', 404);
    }
    return testimonial;
  }

  /**
   * Approve testimonial (admin only)
   */
  async approveTestimonial(id: string): Promise<ITestimonial> {
    const testimonial = await testimonialRepository.approve(id);
    if (!testimonial) {
      throw new AppError('Testimonial not found', 404);
    }
    return testimonial;
  }

  /**
   * Reject testimonial (admin only)
   */
  async rejectTestimonial(id: string): Promise<ITestimonial> {
    const testimonial = await testimonialRepository.reject(id);
    if (!testimonial) {
      throw new AppError('Testimonial not found', 404);
    }
    return testimonial;
  }

  /**
   * Get testimonial statistics
   */
  async getTestimonialStats(): Promise<any> {
    return await testimonialRepository.getStats();
  }

  /**
   * Search testimonials
   */
  async searchTestimonials(
    searchTerm: string,
    options: PaginationOptions = {}
  ): Promise<{ testimonials: ITestimonial[]; total: number; page: number; totalPages: number }> {
    return await testimonialRepository.findAll(
      { search: searchTerm, isActive: true, isApproved: true },
      options
    );
  }
}

export default new TestimonialService();
