import userRepository from '../repositories/user.repository';
import blogRepository from '../repositories/blog.repository';
import testimonialRepository from '../repositories/testimonial.repository';
import reelRepository from '../repositories/reel.repository';
import videoRepository from '../repositories/video.repository';
import leadRepository from '../repositories/lead.repository';
import materialRepository from '../repositories/material.repository';
import bookingRepository from '../repositories/booking.repository';
import counselorRepository from '../repositories/counselor.repository';
import categoryRepository from '../repositories/category.repository';
import bannerRepository from '../repositories/banner.repository';

class SummaryService {
  /**
   * Get dashboard summary with statistics from all modules
   */
  async getDashboardSummary(): Promise<any> {
    try {
      // Fetch all statistics in parallel for better performance
      const [
        userStats,
        blogStats,
        testimonialStats,
        reelStats,
        videoStats,
        leadStats,
        materialStats,
        bookingStats,
        counselorStats,
        categoryStats,
        bannerStats,
      ] = await Promise.all([
        this.getUserStats(),
        this.getBlogStats(),
        this.getTestimonialStats(),
        this.getReelStats(),
        this.getVideoStats(),
        this.getLeadStats(),
        this.getMaterialStats(),
        this.getBookingStats(),
        this.getCounselorStats(),
        this.getCategoryStats(),
        this.getBannerStats(),
      ]);

      return {
        users: userStats,
        blogs: blogStats,
        testimonials: testimonialStats,
        reels: reelStats,
        videos: videoStats,
        leads: leadStats,
        materials: materialStats,
        bookings: bookingStats,
        counselors: counselorStats,
        categories: categoryStats,
        banners: bannerStats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  private async getUserStats(): Promise<any> {
    const [active, inactive] = await Promise.all([
      userRepository.countActive(),
      userRepository.countInactive(),
    ]);

    const total = active + inactive;

    return {
      total,
      active,
      inactive,
    };
  }

  /**
   * Get blog statistics
   */
  private async getBlogStats(): Promise<any> {
    const stats = await blogRepository.getStats();
    return stats;
  }

  /**
   * Get testimonial statistics
   */
  private async getTestimonialStats(): Promise<any> {
    const stats = await testimonialRepository.getStats();
    return stats;
  }

  /**
   * Get reel statistics
   */
  private async getReelStats(): Promise<any> {
    const stats = await reelRepository.getStats();
    return stats;
  }

  /**
   * Get video statistics
   */
  private async getVideoStats(): Promise<any> {
    const stats = await videoRepository.getStats();
    return stats;
  }

  /**
   * Get lead statistics
   */
  private async getLeadStats(): Promise<any> {
    const stats = await leadRepository.getStats();
    return stats;
  }

  /**
   * Get material statistics
   */
  private async getMaterialStats(): Promise<any> {
    const stats = await materialRepository.getStats();
    return stats;
  }

  /**
   * Get booking statistics
   */
  private async getBookingStats(): Promise<any> {
    const stats = await bookingRepository.getStats();
    return stats;
  }

  /**
   * Get counselor statistics
   */
  private async getCounselorStats(): Promise<any> {
    const stats = await counselorRepository.getStats();
    return stats;
  }

  /**
   * Get category statistics
   */
  private async getCategoryStats(): Promise<any> {
    const stats = await categoryRepository.getStats();
    return stats;
  }

  /**
   * Get banner statistics
   */
  private async getBannerStats(): Promise<any> {
    const stats = await bannerRepository.getStats();
    return stats;
  }
}

export default new SummaryService();
