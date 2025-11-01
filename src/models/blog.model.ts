import { BaseModel } from './base.model';

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface IBlog extends BaseModel {
  id: string; // UUID - Primary Key
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  authorId: string; // User ID
  tags: string[];
  status: BlogStatus;
  publishedAt: string | null; // ISO 8601 timestamp
  viewCount: number;
}

export interface CreateBlogInput {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  authorId: string;
  tags?: string[];
  status?: BlogStatus;
}

export interface UpdateBlogInput {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  tags?: string[];
  status?: BlogStatus;
  publishedAt?: string | null;
  viewCount?: number;
  isActive?: boolean;
}

/**
 * Author info for blog response
 */
export interface BlogAuthor {
  id: string;
  name: string;
  email: string;
}

/**
 * Blog response interface with populated author
 */
export interface BlogResponse extends Omit<IBlog, 'authorId'> {
  author: BlogAuthor;
  readTime: number;
}

// Utility class for blog operations
export class BlogUtils {
  // Generate slug from title
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Calculate read time (approximate, based on 200 words per minute)
  static calculateReadTime(content: string): number {
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / 200);
  }

  // Add read time to blog response
  static withReadTime(blog: IBlog): IBlog & { readTime: number } {
    return {
      ...blog,
      readTime: this.calculateReadTime(blog.content),
    };
  }
}

export default IBlog;
