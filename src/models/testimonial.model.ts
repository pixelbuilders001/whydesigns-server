import { BaseModel } from './base.model';

export interface ITestimonial extends BaseModel {
  id: string; // UUID - Primary Key
  userId?: string; // Optional - guests can submit testimonials
  name: string;
  email: string;
  city?: string;
  state?: string;
  country?: string;
  rating: number;
  message: string;
  designation?: string;
  company?: string;
  profileImage?: string;
  isFavorite: boolean;
  isPublished: boolean;
  publishedAt?: string; // ISO 8601 timestamp
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  displayOrder?: number;
}

export interface CreateTestimonialInput {
  userId?: string;
  name: string;
  email: string;
  city?: string;
  state?: string;
  country?: string;
  rating: number;
  message: string;
  designation?: string;
  company?: string;
  profileImage?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export interface UpdateTestimonialInput {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  rating?: number;
  message?: string;
  designation?: string;
  company?: string;
  profileImage?: string;
  isFavorite?: boolean;
  isPublished?: boolean;
  publishedAt?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  displayOrder?: number;
  isActive?: boolean;
}

// Utility class
export class TestimonialUtils {
  static getFullLocation(testimonial: ITestimonial): string {
    const parts = [testimonial.city, testimonial.state, testimonial.country].filter(Boolean);
    return parts.join(', ');
  }
}

export default ITestimonial;
