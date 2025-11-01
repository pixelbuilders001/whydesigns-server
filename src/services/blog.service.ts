import blogRepository, { BlogFilters } from '../repositories/blog.repository';
import { IBlog, BlogStatus, BlogResponse, BlogAuthor } from '../models/blog.model';
import { PaginationOptions } from '../types';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../utils/AppError';
import userRepository from '../repositories/user.repository';
import { BlogUtils } from '../models/blog.model';

interface CreateBlogData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  authorId: string;
  tags?: string[];
  status?: BlogStatus;
}

interface UpdateBlogData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  tags?: string[];
  status?: BlogStatus;
}

export class BlogService {
  /**
   * Helper method to populate author data
   */
  private async populateAuthor(blog: IBlog): Promise<BlogResponse> {
    const user = await userRepository.findById(blog.authorId);

    const author: BlogAuthor = user
      ? {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`.trim() || 'Unknown Author',
          email: user.email,
        }
      : {
          id: blog.authorId,
          name: 'Unknown Author',
          email: '',
        };

    const { authorId, ...blogData } = blog;
    return {
      ...blogData,
      author,
      readTime: BlogUtils.calculateReadTime(blog.content),
    };
  }

  async createBlog(data: CreateBlogData): Promise<IBlog> {
    const { title, slug, content, excerpt, featuredImage, authorId, tags, status } = data;

    // Generate slug from title if not provided
    const blogSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingSlug = await blogRepository.existsBySlug(blogSlug);
    if (existingSlug) {
      throw new ConflictError('Blog slug already exists');
    }

    // Generate excerpt from content if not provided
    const blogExcerpt = excerpt || content.substring(0, 200).trim() + '...';

    // Create blog
    const blog = await blogRepository.create({
      title,
      slug: blogSlug,
      content,
      excerpt: blogExcerpt,
      featuredImage: featuredImage || '',
      authorId: authorId as any,
      tags: tags || [],
      status: status || 'draft',
    });

    return blog;
  }

  async getAllBlogs(options: PaginationOptions, filters: BlogFilters = {}): Promise<{ blogs: IBlog[]; total: number }> {
    return await blogRepository.findAll(options, filters);
  }

  async getAllBlogsWithAuthor(options: PaginationOptions, filters: BlogFilters = {}): Promise<{ blogs: BlogResponse[]; total: number }> {
    const result = await blogRepository.findAll(options, filters);
    const blogsWithAuthor = await Promise.all(
      result.blogs.map(blog => this.populateAuthor(blog))
    );
    return { blogs: blogsWithAuthor, total: result.total };
  }

  async getPublishedBlogs(options: PaginationOptions): Promise<{ blogs: IBlog[]; total: number }> {
    return await blogRepository.findPublishedBlogs(options);
  }

  async getPublishedBlogsWithAuthor(options: PaginationOptions): Promise<{ blogs: BlogResponse[]; total: number }> {
    const result = await blogRepository.findPublishedBlogs(options);
    const blogsWithAuthor = await Promise.all(
      result.blogs.map(blog => this.populateAuthor(blog))
    );
    return { blogs: blogsWithAuthor, total: result.total };
  }

  async getBlogById(id: string, userId?: string, userRole?: string): Promise<IBlog> {
    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }

    // If blog is not published, only author or admin can view it
    if (blog.status !== 'published') {
      if (!userId) {
        throw new ForbiddenError('This blog is not published yet');
      }
      if (blog.authorId.toString() !== userId && userRole !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to view this blog');
      }
    }

    // Increment view count only for published blogs
    if (blog.status === 'published') {
      await blogRepository.incrementViewCount(id);
    }

    return blog;
  }

  async getBlogByIdWithAuthor(id: string, userId?: string, userRole?: string): Promise<BlogResponse> {
    const blog = await this.getBlogById(id, userId, userRole);
    return await this.populateAuthor(blog);
  }

  async getBlogBySlug(slug: string, userId?: string, userRole?: string): Promise<IBlog> {
    const blog = await blogRepository.findBySlug(slug);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }

    // If blog is not published, only author or admin can view it
    if (blog.status !== 'published') {
      if (!userId) {
        throw new ForbiddenError('This blog is not published yet');
      }
      if (blog.authorId.toString() !== userId && userRole !== 'ADMIN') {
        throw new ForbiddenError('You do not have permission to view this blog');
      }
    }

    // Increment view count only for published blogs
    if (blog.status === 'published') {
      await blogRepository.incrementViewCount(blog.id);
    }

    return blog;
  }

  async getBlogBySlugWithAuthor(slug: string, userId?: string, userRole?: string): Promise<BlogResponse> {
    const blog = await this.getBlogBySlug(slug, userId, userRole);
    return await this.populateAuthor(blog);
  }

  async getMyBlogs(authorId: string, options: PaginationOptions, filters: BlogFilters = {}): Promise<{ blogs: IBlog[]; total: number }> {
    return await blogRepository.findByAuthor(authorId, options, filters);
  }

  async getBlogsByAuthor(authorId: string, options: PaginationOptions): Promise<{ blogs: IBlog[]; total: number }> {
    // Only return published blogs for public author view
    return await blogRepository.findByAuthor(authorId, options, { status: 'published', isActive: true });
  }

  async getBlogsByTags(tags: string[], options: PaginationOptions): Promise<{ blogs: IBlog[]; total: number }> {
    if (!tags || tags.length === 0) {
      throw new BadRequestError('At least one tag is required');
    }
    return await blogRepository.findByTags(tags, options);
  }

  async updateBlog(id: string, userId: string, userRole: string, data: UpdateBlogData): Promise<IBlog> {
    const { title, slug, content, excerpt, featuredImage, tags, status } = data;

    // Check if blog exists
    const existingBlog = await blogRepository.findById(id);
    if (!existingBlog) {
      throw new NotFoundError('Blog not found');
    }

    // Check authorization - only author or admin can update
    if (existingBlog.authorId.toString() !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to update this blog');
    }

    // Check if slug is being updated and if it already exists
    if (slug && slug !== existingBlog.slug) {
      const slugExists = await blogRepository.existsBySlug(slug, id);
      if (slugExists) {
        throw new ConflictError('Blog slug already exists');
      }
    }

    // Build update data
    const updateData: Partial<IBlog> = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (tags !== undefined) updateData.tags = tags;
    if (status !== undefined) {
      updateData.status = status;
      // Set publishedAt if status is changing to published
      if (status === 'published' && !existingBlog.publishedAt) {
        updateData.publishedAt = new Date().toISOString();
      }
    }

    const updatedBlog = await blogRepository.update(id, updateData);
    if (!updatedBlog) {
      throw new NotFoundError('Blog not found');
    }

    return updatedBlog;
  }

  async publishBlog(id: string, userId: string, userRole: string): Promise<IBlog> {
    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }

    // Check authorization - only author or admin can publish
    if (blog.authorId.toString() !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to publish this blog');
    }

    if (blog.status === 'published') {
      throw new BadRequestError('Blog is already published');
    }

    const publishedBlog = await blogRepository.publishBlog(id);
    if (!publishedBlog) {
      throw new NotFoundError('Blog not found');
    }

    return publishedBlog;
  }

  async unpublishBlog(id: string, userId: string, userRole: string): Promise<IBlog> {
    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }

    // Check authorization - only author or admin can unpublish
    if (blog.authorId.toString() !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to unpublish this blog');
    }

    if (blog.status !== 'published') {
      throw new BadRequestError('Blog is not published');
    }

    const unpublishedBlog = await blogRepository.unpublishBlog(id);
    if (!unpublishedBlog) {
      throw new NotFoundError('Blog not found');
    }

    return unpublishedBlog;
  }

  async deleteBlog(id: string, userId: string, userRole: string): Promise<void> {
    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }

    // Check authorization - only author or admin can delete
    if (blog.authorId.toString() !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this blog');
    }

    await blogRepository.delete(id);
  }

  async softDeleteBlog(id: string, userId: string, userRole: string): Promise<IBlog> {
    const blog = await blogRepository.findById(id);
    if (!blog) {
      throw new NotFoundError('Blog not found');
    }

    // Check authorization - only author or admin can delete
    if (blog.authorId.toString() !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to delete this blog');
    }

    const deletedBlog = await blogRepository.softDelete(id);
    if (!deletedBlog) {
      throw new NotFoundError('Blog not found');
    }

    return deletedBlog;
  }

  async searchBlogs(query: string, options: PaginationOptions): Promise<{ blogs: IBlog[]; total: number }> {
    if (!query || query.trim() === '') {
      throw new BadRequestError('Search query is required');
    }

    try {
      // Try text search first
      return await blogRepository.search(query, options);
    } catch (error) {
      // Fallback to regex search if text index doesn't exist
      return await blogRepository.searchFallback(query, options);
    }
  }

  async getMostViewedBlogs(limit: number = 10): Promise<IBlog[]> {
    return await blogRepository.getMostViewedBlogs(limit);
  }

  async getRecentBlogs(limit: number = 10): Promise<IBlog[]> {
    return await blogRepository.getRecentBlogs(limit);
  }

  async getAllTags(): Promise<string[]> {
    return await blogRepository.getAllTags();
  }

  async getBlogStats(authorId?: string): Promise<any> {
    if (authorId) {
      // Stats for specific author
      const [total, published, draft, archived] = await Promise.all([
        blogRepository.countByAuthor(authorId),
        blogRepository.countByAuthor(authorId, 'published'),
        blogRepository.countByAuthor(authorId, 'draft'),
        blogRepository.countByAuthor(authorId, 'archived'),
      ]);

      return { total, published, draft, archived };
    } else {
      // Global stats
      const [published, draft, archived] = await Promise.all([
        blogRepository.countByStatus('published'),
        blogRepository.countByStatus('draft'),
        blogRepository.countByStatus('archived'),
      ]);

      return {
        total: published + draft + archived,
        published,
        draft,
        archived,
      };
    }
  }
}

export default new BlogService();
