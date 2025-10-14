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
        required: ['firstName', 'lastName', 'email', 'password', 'phoneNumber', 'dateOfBirth', 'gender'],
        properties: {
          firstName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'John',
          },
          lastName: {
            type: 'string',
            minLength: 2,
            maxLength: 50,
            example: 'Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'password123',
          },
          phoneNumber: {
            type: 'string',
            example: '+1234567890',
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            example: '1990-01-15',
          },
          gender: {
            type: 'string',
            enum: ['male', 'female', 'other'],
            example: 'male',
          },
          address: {
            type: 'string',
            example: '123 Main Street, New York',
          },
          profilePicture: {
            type: 'string',
            format: 'uri',
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
  ],
};

const options: swaggerJSDoc.Options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/models/*.ts', './src/docs/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
