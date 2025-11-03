import { IBlog, BlogStatus } from '../models/blog.model';
import { BaseRepository } from './base.repository';
import { TABLES } from '../config/dynamodb.tables';
import { PaginationOptions } from '../types';
import { createBaseFields } from '../models/base.model';

export interface BlogFilters {
  status?: BlogStatus;
  authorId?: string;
  tags?: string[];
  isActive?: boolean;
}

export class BlogRepository extends BaseRepository<IBlog> {
  constructor() {
    super(TABLES.BLOGS);
  }

  async create(blogData: Partial<IBlog>): Promise<IBlog> {
    const id = this.generateId();

    const blog: any = {
      id,
      title: blogData.title || '',
      slug: blogData.slug || '',
      content: blogData.content || '',
      excerpt: blogData.excerpt || '',
      featuredImage: blogData.featuredImage || '',
      authorId: blogData.authorId || '',
      status: blogData.status || 'draft',
      tags: blogData.tags || [],
      viewCount: blogData.viewCount || 0,
      publishedAt: null, // Default to null for draft blogs
      ...createBaseFields(),
    };

    // Only add publishedAt if it has a value and ensure it's a string
    if (blogData.publishedAt) {
      blog.publishedAt = typeof blogData.publishedAt === 'string'
        ? blogData.publishedAt
        : new Date(blogData.publishedAt).toISOString();
    }

    return await this.putItem(blog);
  }

  async findById(id: string): Promise<IBlog | null> {
    return await this.getItem({ id: id });
  }

  async findBySlug(slug: string): Promise<IBlog | null> {
    const result = await this.scanItems({
      filterExpression: '#slug = :slug AND #isActive = :isActive',
      expressionAttributeNames: { '#slug': 'slug', '#isActive': 'isActive' },
      expressionAttributeValues: { ':slug': slug, ':isActive': true },
      limit: 1,
    });

    return result.items[0] || null;
  }

  async findAll(
    options: PaginationOptions,
    filters: BlogFilters = {}
  ): Promise<{ blogs: IBlog[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    // Build filter expression
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    if (filters.status) {
      filterExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = filters.status;
    }

    if (filters.authorId) {
      filterExpressions.push('#authorId = :authorId');
      expressionAttributeNames['#authorId'] = 'authorId';
      expressionAttributeValues[':authorId'] = filters.authorId;
    }

    if (filters.isActive !== undefined) {
      filterExpressions.push('#isActive = :isActive');
      expressionAttributeNames['#isActive'] = 'isActive';
      expressionAttributeValues[':isActive'] = filters.isActive;
    }

    // Scan with filters
    const result = await this.scanItems({
      filterExpression: filterExpressions.length > 0 ? filterExpressions.join(' AND ') : undefined,
      expressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      expressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
    });

    let blogs = result.items;

    // Filter by tags in memory if specified
    if (filters.tags && filters.tags.length > 0) {
      blogs = blogs.filter(blog =>
        blog.tags && filters.tags!.some(tag => blog.tags.includes(tag))
      );
    }

    // Sort in memory
    const sortedBlogs = this.sortItems(blogs, sortBy, order);

    // Paginate in memory
    const skip = (page - 1) * limit;
    const paginatedBlogs = sortedBlogs.slice(skip, skip + limit);

    return { blogs: paginatedBlogs, total: sortedBlogs.length };
  }

  async findPublishedBlogs(options: PaginationOptions): Promise<{ blogs: IBlog[]; total: number }> {
    return this.findAll(options, { status: 'published', isActive: true });
  }

  async findByAuthor(
    authorId: string,
    options: PaginationOptions,
    filters: BlogFilters = {}
  ): Promise<{ blogs: IBlog[]; total: number }> {
    return this.findAll(options, { ...filters, authorId });
  }

  async findByTags(
    tags: string[],
    options: PaginationOptions
  ): Promise<{ blogs: IBlog[]; total: number }> {
    return this.findAll(options, { tags, status: 'published', isActive: true });
  }

  async update(id: string, updateData: Partial<IBlog>): Promise<IBlog | null> {
    return await this.updateItem({ id: id }, updateData);
  }

  async delete(id: string): Promise<IBlog | null> {
    const blog = await this.findById(id);
    await this.hardDeleteItem({ id: id });
    return blog;
  }

  async softDelete(id: string): Promise<IBlog | null> {
    return await this.softDeleteItem({ id: id });
  }

  async incrementViewCount(id: string): Promise<void> {
    const blog = await this.findById(id);
    if (blog) {
      await this.updateItem({ id: id }, { viewCount: (blog.viewCount || 0) + 1 });
    }
  }

  async publishBlog(id: string): Promise<IBlog | null> {
    return await this.update(id, { status: 'published', publishedAt: new Date().toISOString() });
  }

  async unpublishBlog(id: string): Promise<IBlog | null> {
    return await this.update(id, { status: 'draft' });
  }

  async archiveBlog(id: string): Promise<IBlog | null> {
    return await this.update(id, { status: 'archived' });
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const result = await this.scanItems({
      filterExpression: '#slug = :slug',
      expressionAttributeNames: { '#slug': 'slug' },
      expressionAttributeValues: { ':slug': slug },
      limit: 2,
    });

    if (excludeId) {
      return result.items.some(blog => blog.id !== excludeId);
    }

    return result.items.length > 0;
  }

  async search(
    query: string,
    options: PaginationOptions
  ): Promise<{ blogs: IBlog[]; total: number }> {
    const { page, limit, sortBy, order } = options;

    // Scan all published blogs
    const result = await this.scanItems({
      filterExpression: '#status = :status AND #isActive = :isActive',
      expressionAttributeNames: { '#status': 'status', '#isActive': 'isActive' },
      expressionAttributeValues: { ':status': 'published', ':isActive': true },
    });

    // Filter in memory (DynamoDB doesn't support full-text search like MongoDB)
    const queryLower = query.toLowerCase();
    const filteredBlogs = result.items.filter((blog) => {
      return (
        blog.title?.toLowerCase().includes(queryLower) ||
        blog.content?.toLowerCase().includes(queryLower) ||
        blog.excerpt?.toLowerCase().includes(queryLower) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(queryLower))
      );
    });

    // Sort
    const sortedBlogs = this.sortItems(filteredBlogs, sortBy, order);

    // Paginate
    const skip = (page - 1) * limit;
    const paginatedBlogs = sortedBlogs.slice(skip, skip + limit);

    return {
      blogs: paginatedBlogs,
      total: filteredBlogs.length,
    };
  }

  async searchFallback(
    query: string,
    options: PaginationOptions
  ): Promise<{ blogs: IBlog[]; total: number }> {
    // Same as search for DynamoDB
    return this.search(query, options);
  }

  async countByAuthor(authorId: string, status?: BlogStatus): Promise<number> {
    const filterExpressions: string[] = ['#authorId = :authorId', '#isActive = :isActive'];
    const expressionAttributeNames: Record<string, string> = { '#authorId': 'authorId', '#isActive': 'isActive' };
    const expressionAttributeValues: Record<string, any> = { ':authorId': authorId, ':isActive': true };

    if (status) {
      filterExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    return await this.countItems(
      filterExpressions.join(' AND '),
      expressionAttributeNames,
      expressionAttributeValues
    );
  }

  async countByStatus(status: BlogStatus): Promise<number> {
    return await this.countItems(
      '#status = :status AND #isActive = :isActive',
      { '#status': 'status', '#isActive': 'isActive' },
      { ':status': status, ':isActive': true }
    );
  }

  async getMostViewedBlogs(limit: number = 10): Promise<IBlog[]> {
    const result = await this.scanItems({
      filterExpression: '#status = :status AND #isActive = :isActive',
      expressionAttributeNames: { '#status': 'status', '#isActive': 'isActive' },
      expressionAttributeValues: { ':status': 'published', ':isActive': true },
    });

    const sorted = this.sortItems(result.items, 'viewCount', 'desc');
    return sorted.slice(0, limit);
  }

  async getRecentBlogs(limit: number = 10): Promise<IBlog[]> {
    const result = await this.scanItems({
      filterExpression: '#status = :status AND #isActive = :isActive',
      expressionAttributeNames: { '#status': 'status', '#isActive': 'isActive' },
      expressionAttributeValues: { ':status': 'published', ':isActive': true },
    });

    const sorted = this.sortItems(result.items, 'publishedAt', 'desc');
    return sorted.slice(0, limit);
  }

  async getAllTags(): Promise<string[]> {
    const result = await this.scanItems({
      filterExpression: '#status = :status AND #isActive = :isActive',
      expressionAttributeNames: { '#status': 'status', '#isActive': 'isActive' },
      expressionAttributeValues: { ':status': 'published', ':isActive': true },
    });

    // Extract all unique tags
    const tagsSet = new Set<string>();
    result.items.forEach(blog => {
      if (blog.tags) {
        blog.tags.forEach(tag => tagsSet.add(tag));
      }
    });

    return Array.from(tagsSet).sort();
  }

  async getStats(): Promise<any> {
    const result = await this.scanItems({
      filterExpression: '#isActive = :isActive',
      expressionAttributeNames: { '#isActive': 'isActive' },
      expressionAttributeValues: { ':isActive': true },
    });

    const total = result.items.length;
    const published = result.items.filter(b => b.status === 'published').length;
    const draft = result.items.filter(b => b.status === 'draft').length;
    const archived = result.items.filter(b => b.status === 'archived').length;
    const totalViews = result.items.reduce((sum, b) => sum + (b.viewCount || 0), 0);

    const publishedBlogs = result.items.filter(b => b.status === 'published');
    const avgViews = publishedBlogs.length > 0
      ? (publishedBlogs.reduce((sum, b) => sum + (b.viewCount || 0), 0) / publishedBlogs.length).toFixed(2)
      : 0;

    return {
      total,
      published,
      draft,
      archived,
      totalViews,
      averageViews: avgViews,
    };
  }

  /**
   * Helper method to sort items in memory
   */
  private sortItems(items: IBlog[], sortBy: string, order: string): IBlog[] {
    return items.sort((a, b) => {
      const aVal = (a as any)[sortBy];
      const bVal = (b as any)[sortBy];

      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}

export default new BlogRepository();
