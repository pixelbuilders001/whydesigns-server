import Joi from 'joi';

export const createBlogSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    'string.empty': 'Blog title is required',
    'string.min': 'Blog title must be at least 5 characters',
    'string.max': 'Blog title must not exceed 200 characters',
  }),
  slug: Joi.string()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional()
    .messages({
      'string.pattern.base': 'Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)',
    }),
  content: Joi.string().min(50).required().messages({
    'string.empty': 'Blog content is required',
    'string.min': 'Blog content must be at least 50 characters',
  }),
  excerpt: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Excerpt must not exceed 500 characters',
  }),
  featuredImage: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Featured image must be a valid URL',
  }),
  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string()).max(10),
      Joi.string().custom((value, helpers) => {
        // Handle comma-separated string from form data
        if (value.trim() === '') return [];
        const tagsArray = value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
        if (tagsArray.length > 10) {
          return helpers.error('array.max');
        }
        return tagsArray;
      })
    )
    .optional()
    .messages({
      'array.max': 'A blog can have a maximum of 10 tags',
    }),
  status: Joi.string().valid('draft', 'published', 'archived').optional().default('draft').messages({
    'any.only': 'Status must be draft, published, or archived',
  }),
});

export const updateBlogSchema = Joi.object({
  title: Joi.string().min(5).max(200).optional().messages({
    'string.min': 'Blog title must be at least 5 characters',
    'string.max': 'Blog title must not exceed 200 characters',
  }),
  slug: Joi.string()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional()
    .messages({
      'string.pattern.base': 'Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)',
    }),
  content: Joi.string().min(50).optional().messages({
    'string.min': 'Blog content must be at least 50 characters',
  }),
  excerpt: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Excerpt must not exceed 500 characters',
  }),
  featuredImage: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Featured image must be a valid URL',
  }),
  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string()).max(10),
      Joi.string().custom((value, helpers) => {
        // Handle comma-separated string from form data
        if (value.trim() === '') return [];
        const tagsArray = value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
        if (tagsArray.length > 10) {
          return helpers.error('array.max');
        }
        return tagsArray;
      })
    )
    .optional()
    .messages({
      'array.max': 'A blog can have a maximum of 10 tags',
    }),
  status: Joi.string().valid('draft', 'published', 'archived').optional().messages({
    'any.only': 'Status must be draft, published, or archived',
  }),
});

export const blogPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string().valid('draft', 'published', 'archived').optional(),
  authorId: Joi.string().optional(),
  search: Joi.string().optional(),
});

export const blogIdParamSchema = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'Blog ID is required',
  }),
});

export const blogSlugParamSchema = Joi.object({
  slug: Joi.string().required().messages({
    'string.empty': 'Blog slug is required',
  }),
});

export const blogTagsQuerySchema = Joi.object({
  tags: Joi.alternatives()
    .try(
      Joi.string(), // Single tag as string
      Joi.array().items(Joi.string()).min(1) // Multiple tags as array
    )
    .required()
    .messages({
      'alternatives.match': 'Tags must be a string or an array of strings',
      'any.required': 'At least one tag is required',
    }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

export const searchBlogSchema = Joi.object({
  q: Joi.string().min(2).required().messages({
    'string.empty': 'Search query is required',
    'string.min': 'Search query must be at least 2 characters',
  }),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});
