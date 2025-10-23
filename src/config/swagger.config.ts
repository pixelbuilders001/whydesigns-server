import swaggerJSDoc from 'swagger-jsdoc';
import { config } from './env.config';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Why Designers API',
    version: '1.0.0',
    description: 'RESTful API documentation for Why Designers platform',
    contact: {
      name: 'API Support',
      email: 'support@why-designers.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.PORT}/api/v1`,
      description: 'Development Server',
    },
    {
      url: 'https://api.why-designers.com/api/v1',
      description: 'Production Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'User ID',
            example: '64abc123def456789',
          },
          firstName: {
            type: 'string',
            description: 'User first name',
            example: 'John',
          },
          lastName: {
            type: 'string',
            description: 'User last name',
            example: 'Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'john.doe@example.com',
          },
          phoneNumber: {
            type: 'string',
            description: 'User phone number with country code',
            example: '+1234567890',
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            description: 'User date of birth',
            example: '1990-01-15',
          },
          gender: {
            type: 'string',
            enum: ['male', 'female', 'other'],
            description: 'User gender',
            example: 'male',
          },
          address: {
            type: 'string',
            description: 'User address',
            example: '123 Main Street, New York',
          },
          profilePicture: {
            type: 'string',
            format: 'uri',
            description: 'Profile picture URL',
            example: 'https://example.com/profile.jpg',
          },
          roleId: {
            type: 'object',
            properties: {
              _id: {
                type: 'string',
                example: '64xyz...',
              },
              name: {
                type: 'string',
                example: 'USER',
              },
            },
          },
          isEmailVerified: {
            type: 'boolean',
            description: 'Email verification status',
            example: false,
          },
          isPhoneVerified: {
            type: 'boolean',
            description: 'Phone verification status',
            example: false,
          },
          isActive: {
            type: 'boolean',
            description: 'Account active status',
            example: true,
          },
          provider: {
            type: 'string',
            enum: ['google', 'facebook', 'local'],
            description: 'Authentication provider',
            example: 'local',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'User creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'User last update timestamp',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          firstName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            description: 'Optional - First name (min 2, max 50 characters)',
            example: 'John',
          },
          lastName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            description: 'Optional - Last name (min 2, max 50 characters)',
            example: 'Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Required - Valid email address',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            minLength: 6,
            description: 'Required - Password (minimum 6 characters)',
            example: 'password123',
          },
          phoneNumber: {
            type: 'string',
            description: 'Optional - Phone number with country code',
            example: '+1234567890',
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            description: 'Optional - Date of birth (YYYY-MM-DD format)',
            example: '1990-01-15',
          },
          gender: {
            type: 'string',
            enum: ['male', 'female', 'other'],
            description: 'Optional - Gender (male, female, or other)',
            example: 'male',
          },
          address: {
            type: 'string',
            description: 'Optional - User address',
            example: '123 Main Street, New York',
          },
          profilePicture: {
            type: 'string',
            format: 'uri',
            description: 'Optional - Profile picture URL',
            example: 'https://example.com/profile.jpg',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            example: 'password123',
          },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Login successful',
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User',
              },
              token: {
                type: 'string',
                description: 'JWT access token',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              refreshToken: {
                type: 'string',
                description: 'JWT refresh token',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
            },
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
          data: {
            type: 'object',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Users retrieved successfully',
          },
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/User',
            },
          },
          meta: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                example: 1,
              },
              limit: {
                type: 'number',
                example: 10,
              },
              total: {
                type: 'number',
                example: 45,
              },
              totalPages: {
                type: 'number',
                example: 5,
              },
            },
          },
        },
      },
      Material: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Material ID',
            example: '64abc123def456789',
          },
          name: {
            type: 'string',
            description: 'Material name',
            example: 'Course Syllabus 2024',
          },
          description: {
            type: 'string',
            description: 'Material description',
            example: 'Comprehensive course syllabus for the academic year 2024',
          },
          fileUrl: {
            type: 'string',
            format: 'uri',
            description: 'S3 file URL',
            example: 'https://s3.amazonaws.com/bucket/materials/file.pdf',
          },
          fileName: {
            type: 'string',
            description: 'Original file name',
            example: 'syllabus-2024.pdf',
          },
          fileType: {
            type: 'string',
            description: 'MIME type of the file',
            example: 'application/pdf',
          },
          fileSize: {
            type: 'number',
            description: 'File size in bytes',
            example: 2048576,
          },
          category: {
            type: 'string',
            description: 'Material category',
            example: 'Academic',
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Tags for categorization',
            example: ['syllabus', '2024', 'course'],
          },
          uploadedBy: {
            type: 'object',
            properties: {
              _id: {
                type: 'string',
                example: '64xyz...',
              },
              name: {
                type: 'string',
                example: 'Admin User',
              },
              email: {
                type: 'string',
                example: 'admin@example.com',
              },
            },
          },
          downloadCount: {
            type: 'number',
            description: 'Number of times downloaded',
            example: 42,
          },
          isActive: {
            type: 'boolean',
            description: 'Active status',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Testimonial: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Testimonial ID',
            example: '64abc123def456789',
          },
          userId: {
            type: 'object',
            properties: {
              _id: {
                type: 'string',
                example: '64xyz...',
              },
              firstName: {
                type: 'string',
                example: 'John',
              },
              lastName: {
                type: 'string',
                example: 'Doe',
              },
              email: {
                type: 'string',
                example: 'john@example.com',
              },
            },
          },
          name: {
            type: 'string',
            description: 'Name of the person giving testimonial',
            example: 'John Doe',
            minLength: 2,
            maxLength: 100,
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address',
            example: 'john.doe@example.com',
          },
          city: {
            type: 'string',
            description: 'City name (optional)',
            example: 'Mumbai',
            minLength: 2,
            maxLength: 100,
          },
          state: {
            type: 'string',
            description: 'State name (optional)',
            example: 'Maharashtra',
            minLength: 2,
            maxLength: 100,
          },
          country: {
            type: 'string',
            description: 'Country name',
            example: 'India',
            maxLength: 100,
          },
          rating: {
            type: 'integer',
            description: 'Rating from 1-5 stars',
            example: 5,
            minimum: 1,
            maximum: 5,
          },
          message: {
            type: 'string',
            description: 'Testimonial message',
            example: 'Great service and excellent support!',
            minLength: 10,
            maxLength: 2000,
          },
          designation: {
            type: 'string',
            description: 'Job designation',
            example: 'CEO',
            maxLength: 100,
          },
          company: {
            type: 'string',
            description: 'Company name',
            example: 'Tech Corp',
            maxLength: 100,
          },
          profileImage: {
            type: 'string',
            format: 'uri',
            description: 'Profile image URL',
            example: 'https://s3.amazonaws.com/bucket/testimonials/profile.jpg',
          },
          isFavorite: {
            type: 'boolean',
            description: 'Favorite status (admin only)',
            example: false,
          },
          isApproved: {
            type: 'boolean',
            description: 'Approval status',
            example: false,
          },
          isActive: {
            type: 'boolean',
            description: 'Active status',
            example: true,
          },
          socialMedia: {
            type: 'object',
            properties: {
              facebook: {
                type: 'string',
                description: 'Facebook profile URL',
                example: 'https://facebook.com/johndoe',
              },
              instagram: {
                type: 'string',
                description: 'Instagram profile URL',
                example: 'https://instagram.com/johndoe',
              },
              twitter: {
                type: 'string',
                description: 'Twitter/X profile URL',
                example: 'https://twitter.com/johndoe',
              },
              linkedin: {
                type: 'string',
                description: 'LinkedIn profile URL',
                example: 'https://linkedin.com/in/johndoe',
              },
            },
          },
          displayOrder: {
            type: 'integer',
            description: 'Display order for sorting',
            example: 0,
          },
          fullLocation: {
            type: 'string',
            description: 'Full location string',
            example: 'Mumbai, Maharashtra, India',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Reel: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Reel ID',
            example: '64abc123def456789',
          },
          title: {
            type: 'string',
            description: 'Reel title',
            example: 'Amazing Design Showcase',
            minLength: 2,
            maxLength: 200,
          },
          description: {
            type: 'string',
            description: 'Reel description',
            example: 'A showcase of modern design principles',
            maxLength: 1000,
          },
          videoUrl: {
            type: 'string',
            format: 'uri',
            description: 'Video file URL',
            example: 'https://s3.amazonaws.com/bucket/reels/video.mp4',
          },
          thumbnailUrl: {
            type: 'string',
            format: 'uri',
            description: 'Thumbnail image URL',
            example: 'https://s3.amazonaws.com/bucket/reels/thumb.jpg',
          },
          duration: {
            type: 'number',
            description: 'Video duration in seconds (max 180)',
            example: 60,
            minimum: 1,
            maximum: 180,
          },
          fileSize: {
            type: 'number',
            description: 'File size in bytes',
            example: 5242880,
          },
          uploadedBy: {
            type: 'object',
            properties: {
              _id: {
                type: 'string',
                example: '64xyz...',
              },
              firstName: {
                type: 'string',
                example: 'John',
              },
              lastName: {
                type: 'string',
                example: 'Doe',
              },
              email: {
                type: 'string',
                example: 'admin@example.com',
              },
            },
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Tags for categorization (max 10)',
            example: ['design', 'ui', 'inspiration'],
          },
          category: {
            type: 'string',
            description: 'Reel category',
            example: 'UI/UX',
            maxLength: 50,
          },
          viewCount: {
            type: 'number',
            description: 'Number of views',
            example: 1250,
            minimum: 0,
          },
          likeCount: {
            type: 'number',
            description: 'Number of likes',
            example: 85,
            minimum: 0,
          },
          isPublished: {
            type: 'boolean',
            description: 'Publication status',
            example: true,
          },
          isActive: {
            type: 'boolean',
            description: 'Active status',
            example: true,
          },
          displayOrder: {
            type: 'number',
            description: 'Display order for sorting',
            example: 0,
          },
          publishedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Publication timestamp',
          },
          fileSizeFormatted: {
            type: 'string',
            description: 'Formatted file size',
            example: '5.00 MB',
          },
          durationFormatted: {
            type: 'string',
            description: 'Formatted duration',
            example: '1:00',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Lead: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Lead ID',
            example: '64abc123def456789',
          },
          fullName: {
            type: 'string',
            description: 'Full name of the lead',
            example: 'John Doe',
            minLength: 2,
            maxLength: 100,
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address',
            example: 'john.doe@example.com',
          },
          phone: {
            type: 'string',
            description: 'Phone number with country code',
            example: '+1234567890',
          },
          areaOfInterest: {
            type: 'string',
            description: 'Area of interest',
            example: 'Web Design',
            maxLength: 200,
          },
          isActive: {
            type: 'boolean',
            description: 'Active status',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Authentication',
      description: 'User authentication and registration endpoints',
    },
    {
      name: 'User Profile',
      description: 'User profile management endpoints',
    },
    {
      name: 'Admin',
      description: 'Admin-only endpoints for user management',
    },
    {
      name: 'Categories',
      description: 'Blog category management endpoints',
    },
    {
      name: 'Blogs',
      description: 'Blog post management and publishing endpoints',
    },
    {
      name: 'Counselors',
      description: 'Counselor management endpoints',
    },
    {
      name: 'Bookings',
      description: 'Counseling session booking endpoints',
    },
    {
      name: 'Materials',
      description: 'Downloadable materials management endpoints (PDFs, documents, files)',
    },
    {
      name: 'Testimonials',
      description: 'Customer testimonial management endpoints with approval workflow',
    },
    {
      name: 'Reels',
      description: 'Video reel management endpoints for short-form video content',
    },
    {
      name: 'Leads',
      description: 'Lead generation and management endpoints for capturing customer inquiries',
    },
  ],
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/models/*.ts', './src/docs/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
