import { Blog, IBlog, BlogStatus } from '../models/blog.model';
import { PaginationOptions } from '../types';

export interface BlogFilters {
  status?: BlogStatus;
  authorId?: string;
  tags?: string[];
  isActive?: boolean;
}

export class BlogRepository {
  async create(blogData: Partial<IBlog>): Promise<IBlog> {
    const blog = await Blog.create(blogData);
    const createdBlog = await this.findById(blog._id);
    if (!createdBlog) {
      throw new Error('Failed to create blog');
    }
    return createdBlog;
  }

  async findById(id: string): Promise<IBlog | null> {
    return await Blog.findById(id)
      .populate('authorId', 'firstName lastName email profilePicture');
  }

  async findBySlug(slug: string): Promise<IBlog | null> {
    return await Blog.findOne({ slug, isActive: true })
      .populate('authorId', 'firstName lastName email profilePicture');
  }

  async findAll(
    options: PaginationOptions,
    filters: BlogFilters = {}
  ): Promise<{ blogs: IBlog[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    // Build filter
    const filter: any = {};
    if (filters.status) filter.status = filters.status;
    if (filters.authorId) filter.authorId = filters.authorId;
    if (filters.isActive !== undefined) filter.isActive = filters.isActive;
    if (filters.tags && filters.tags.length > 0) {
      filter.tags = { $in: filters.tags };
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('authorId', 'firstName lastName email profilePicture')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(filter),
    ]);

    return { blogs, total };
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
    const blog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('authorId', 'firstName lastName email profilePicture');

    return blog;
  }

  async delete(id: string): Promise<IBlog | null> {
    return await Blog.findByIdAndDelete(id);
  }

  async softDelete(id: string): Promise<IBlog | null> {
    return await this.update(id, { isActive: false });
  }

  async incrementViewCount(id: string): Promise<void> {
    await Blog.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  }

  async publishBlog(id: string): Promise<IBlog | null> {
    return await this.update(id, { status: 'published', publishedAt: new Date() });
  }

  async unpublishBlog(id: string): Promise<IBlog | null> {
    return await this.update(id, { status: 'draft' });
  }

  async archiveBlog(id: string): Promise<IBlog | null> {
    return await this.update(id, { status: 'archived' });
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const filter: any = { slug };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const count = await Blog.countDocuments(filter);
    return count > 0;
  }

  async search(
    query: string,
    options: PaginationOptions
  ): Promise<{ blogs: IBlog[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    // Use text search for better performance
    const searchFilter: any = {
      $text: { $search: query },
      status: 'published',
      isActive: true,
    };

    const [blogs, total] = await Promise.all([
      Blog.find(searchFilter, { score: { $meta: 'textScore' } })
        .populate('authorId', 'firstName lastName email profilePicture')
        .sort({ score: { $meta: 'textScore' }, ...sortOptions })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(searchFilter),
    ]);

    return { blogs, total };
  }

  async searchFallback(
    query: string,
    options: PaginationOptions
  ): Promise<{ blogs: IBlog[]; total: number }> {
    const { page, limit, sortBy, order } = options;
    const skip = (page - 1) * limit;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy]: sortOrder };

    // Fallback to regex search if text index doesn't exist
    const searchFilter = {
      status: 'published' as BlogStatus,
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    };

    const [blogs, total] = await Promise.all([
      Blog.find(searchFilter)
        .populate('authorId', 'firstName lastName email profilePicture')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Blog.countDocuments(searchFilter),
    ]);

    return { blogs, total };
  }

  async countByAuthor(authorId: string, status?: BlogStatus): Promise<number> {
    const filter: any = { authorId, isActive: true };
    if (status) filter.status = status;
    return await Blog.countDocuments(filter);
  }

  async countByStatus(status: BlogStatus): Promise<number> {
    return await Blog.countDocuments({ status, isActive: true });
  }

  async getMostViewedBlogs(limit: number = 10): Promise<IBlog[]> {
    return await Blog.find({ status: 'published', isActive: true })
      .populate('authorId', 'firstName lastName email profilePicture')
      .sort({ viewCount: -1 })
      .limit(limit);
  }

  async getRecentBlogs(limit: number = 10): Promise<IBlog[]> {
    return await Blog.find({ status: 'published', isActive: true })
      .populate('authorId', 'firstName lastName email profilePicture')
      .sort({ publishedAt: -1 })
      .limit(limit);
  }

  async getAllTags(): Promise<string[]> {
    const result = await Blog.aggregate([
      { $match: { status: 'published', isActive: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags' } },
      { $sort: { _id: 1 } },
    ]);
    return result.map((r) => r._id);
  }

  async getStats(): Promise<any> {
    const [total, published, draft, archived, totalViews] = await Promise.all([
      Blog.countDocuments({ isActive: true }),
      Blog.countDocuments({ status: 'published', isActive: true }),
      Blog.countDocuments({ status: 'draft', isActive: true }),
      Blog.countDocuments({ status: 'archived', isActive: true }),
      Blog.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$viewCount' } } },
      ]),
    ]);

    const avgViews = await Blog.aggregate([
      { $match: { status: 'published', isActive: true } },
      { $group: { _id: null, average: { $avg: '$viewCount' } } },
    ]);

    return {
      total,
      published,
      draft,
      archived,
      totalViews: totalViews.length > 0 ? totalViews[0].total : 0,
      averageViews: avgViews.length > 0 ? avgViews[0].average.toFixed(2) : 0,
    };
  }
}

export default new BlogRepository();
