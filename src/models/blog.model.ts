import mongoose, { Document, Schema } from 'mongoose';

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface IBlog extends Document {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  authorId: mongoose.Types.ObjectId;
  tags: string[];
  status: BlogStatus;
  publishedAt: Date | null;
  viewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      minlength: [5, 'Blog title must be at least 5 characters'],
      maxlength: [200, 'Blog title must not exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)'],
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
      minlength: [50, 'Blog content must be at least 50 characters'],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, 'Excerpt must not exceed 500 characters'],
      default: '',
    },
    featuredImage: {
      type: String,
      trim: true,
      default: '',
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'A blog can have a maximum of 10 tags',
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' }); // Text index for search
blogSchema.index({ authorId: 1, status: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ isActive: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ viewCount: -1 });

// Pre-save middleware to set publishedAt when status changes to published
blogSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Helper method to generate slug from title
blogSchema.statics.generateSlug = function (title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Virtual for read time (approximate, based on average reading speed of 200 words per minute)
blogSchema.virtual('readTime').get(function (this: IBlog) {
  const wordCount = this.content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return minutes;
});

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);
