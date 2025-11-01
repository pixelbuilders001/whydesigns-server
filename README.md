# Why Designers - Backend API

A professional Express.js backend API built with TypeScript, AWS DynamoDB, and following best practices including the Controller-Service-Repository pattern.

## Features

- **TypeScript** - Full type safety
- **Express.js** - Fast, unopinionated web framework
- **AWS DynamoDB** - Serverless NoSQL database with AWS SDK v3
- **JWT Authentication** - Secure authentication with refresh tokens
- **Role-based Authorization** - User and admin roles
- **Email Verification** - OTP-based email verification with AWS SES
- **Blog Management** - Complete blog CRUD with categories, tags, and search
- **Category Management** - Blog categorization system
- **Input Validation** - Using Joi schemas
- **Error Handling** - Centralized error handling
- **Security** - Helmet, CORS, Rate limiting
- **File Upload** - AWS S3 integration with Multer
- **API Documentation** - Interactive Swagger/OpenAPI docs
- **Clean Architecture** - Controller-Service-Repository pattern
- **Design Patterns** - Singleton, Factory, Repository patterns

> **Note:** This application was recently migrated from MongoDB to AWS DynamoDB. See [MONGODB_TO_DYNAMODB_MIGRATION.md](./MONGODB_TO_DYNAMODB_MIGRATION.md) for details.

## Project Structure

```
why-designers/
├── src/
│   ├── config/           # Configuration files (DynamoDB, env, swagger, tables)
│   ├── controllers/      # Route controllers (handle requests)
│   ├── services/         # Business logic layer
│   ├── repositories/     # Data access layer (DynamoDB operations)
│   ├── models/           # TypeScript interfaces & utility classes
│   ├── middlewares/      # Custom middlewares (auth, validation, error handling, upload)
│   ├── routes/           # API routes
│   ├── validators/       # Joi validation schemas
│   ├── utils/            # Utility functions and helpers
│   ├── types/            # TypeScript type definitions
│   ├── docs/             # API documentation (Swagger annotations)
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── scripts/              # Utility scripts (DynamoDB table creation)
├── dist/                 # Compiled JavaScript (generated)
├── .env.example          # Environment variables template
├── API_DOCS.md           # API endpoint documentation
├── MONGODB_TO_DYNAMODB_MIGRATION.md  # Migration guide
├── .gitignore
├── tsconfig.json         # TypeScript configuration
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- AWS Account with DynamoDB access (or DynamoDB Local for development)
- AWS CLI configured
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd why-designers
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000

# DynamoDB Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
DYNAMODB_TABLE_PREFIX=why-designers

# For DynamoDB Local (development)
# DYNAMODB_ENDPOINT=http://localhost:8000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
```

5. Create DynamoDB tables:

**Option A: AWS DynamoDB (Production)**
```bash
# Make sure AWS CLI is configured
aws configure

# Run the table creation script
./scripts/create-dynamodb-tables.sh
```

**Option B: DynamoDB Local (Development)**
```bash
# Start DynamoDB Local with Docker
docker run -d -p 8000:8000 --name dynamodb-local amazon/dynamodb-local

# Create tables
./scripts/create-dynamodb-tables.sh --endpoint-url http://localhost:8000

# Set DYNAMODB_ENDPOINT in .env
echo "DYNAMODB_ENDPOINT=http://localhost:8000" >> .env
```

6. Run the development server:
```bash
npm run dev
```

The server will start at `http://localhost:5000`

### DynamoDB Setup

See [MONGODB_TO_DYNAMODB_MIGRATION.md](./MONGODB_TO_DYNAMODB_MIGRATION.md) for detailed DynamoDB table structure and setup instructions.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run start:prod` - Start production server with NODE_ENV=production
- `npm run clean` - Remove build directory
- `npm run rebuild` - Clean and rebuild

## API Documentation

### 📚 Interactive Swagger/OpenAPI Documentation

Once the server is running, access the interactive API documentation at:

**🔗 http://localhost:5000/api-docs**

**Features:**
- ✅ Test all endpoints directly in the browser
- ✅ Built-in authentication (click "Authorize" button)
- ✅ Request/response examples
- ✅ Schema validation
- ✅ Export as JSON: http://localhost:5000/api-docs.json

**How to Use:**
1. Start the server: `npm run dev`
2. Open browser and go to: http://localhost:5000/api-docs
3. Click the **"Authorize"** button (top right)
4. Enter your JWT token in the format: `Bearer <your-token>`
5. Test any endpoint by clicking "Try it out"

### 📄 Markdown Documentation

For detailed endpoint documentation with cURL examples, see [API_DOCS.md](./API_DOCS.md)

## API Endpoints

### Health Check
- `GET /api/v1/health` - Check server status

### Authentication
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/users/refresh-token` - Refresh access token
- `POST /api/v1/users/logout` - Logout user (Protected)

### User Profile
- `GET /api/v1/users/profile` - Get current user profile (Protected)
- `PATCH /api/v1/users/profile` - Update profile (Protected)
- `PUT /api/v1/users/profile/upload` - Update profile with image upload (Protected)
- `POST /api/v1/users/change-password` - Change password (Protected)
- `POST /api/v1/users/verify-email` - Verify email (Protected)
- `POST /api/v1/users/verify-phone` - Verify phone (Protected)

### Admin Only
- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/:id` - Get user by ID (Admin only)
- `PATCH /api/v1/users/:id` - Update user (Admin only)
- `DELETE /api/v1/users/:id` - Delete user (Admin only)
- `POST /api/v1/users/:id/deactivate` - Soft delete user (Admin only)

### Categories
- `GET /api/v1/categories` - Get all categories (Public)
- `GET /api/v1/categories/:id` - Get category by ID (Public)
- `GET /api/v1/categories/slug/:slug` - Get category by slug (Public)
- `POST /api/v1/categories` - Create category (Admin only)
- `PATCH /api/v1/categories/:id` - Update category (Admin only)
- `DELETE /api/v1/categories/:id` - Delete category (Admin only)

### Blogs
- `GET /api/v1/blogs` - Get all published blogs (Public)
- `GET /api/v1/blogs/my-blogs` - Get my blogs (Protected)
- `GET /api/v1/blogs/search` - Search blogs (Public)
- `GET /api/v1/blogs/category/:categoryId` - Get blogs by category (Public)
- `GET /api/v1/blogs/author/:authorId` - Get blogs by author (Public)
- `GET /api/v1/blogs/most-viewed` - Get most viewed blogs (Public)
- `GET /api/v1/blogs/recent` - Get recent blogs (Public)
- `GET /api/v1/blogs/tags` - Get all tags (Public)
- `GET /api/v1/blogs/:id` - Get blog by ID (Public for published)
- `GET /api/v1/blogs/slug/:slug` - Get blog by slug (Public for published)
- `POST /api/v1/blogs` - Create blog (Protected)
- `PATCH /api/v1/blogs/:id` - Update blog (Owner or Admin)
- `POST /api/v1/blogs/:id/publish` - Publish blog (Owner or Admin)
- `DELETE /api/v1/blogs/:id` - Delete blog (Owner or Admin)

## Architecture Patterns

### Controller-Service-Repository Pattern

**Controller Layer** (`controllers/`)
- Handles HTTP requests and responses
- Input validation
- Calls service layer methods
- Returns formatted responses

**Service Layer** (`services/`)
- Contains business logic
- Orchestrates operations
- Calls repository methods
- Handles transactions

**Repository Layer** (`repositories/`)
- Direct database operations
- CRUD operations
- Query building
- Data access abstraction

### Design Patterns Used

1. **Singleton Pattern** - Database connection
2. **Factory Pattern** - Response handlers
3. **Repository Pattern** - Data access layer
4. **Strategy Pattern** - Validation middleware
5. **Dependency Injection** - Service dependencies

## Security Features

- **Helmet** - Sets security HTTP headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevents brute force attacks
- **JWT** - Secure token-based authentication
- **Bcrypt** - Password hashing
- **Input Validation** - Joi schemas prevent injection attacks

## Error Handling

Centralized error handling with custom error classes:
- `BadRequestError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `ValidationError` (422)
- `InternalServerError` (500)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | - |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| BCRYPT_ROUNDS | Bcrypt salt rounds | 10 |
| CORS_ORIGIN | CORS allowed origin | * |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |
| AWS_ACCESS_KEY_ID | AWS access key for S3/SES | - |
| AWS_SECRET_ACCESS_KEY | AWS secret key for S3/SES | - |
| AWS_REGION | AWS region | us-east-1 |
| AWS_S3_BUCKET_NAME | S3 bucket name | - |
| AWS_SES_REGION | AWS SES region | us-east-1 |
| AWS_SES_FROM_EMAIL | Sender email for SES | - |
| AWS_SES_FROM_NAME | Sender name for emails | Why Designers |

### AWS S3 Configuration

For file upload functionality, you need to configure AWS S3:

1. Create an S3 bucket in AWS Console
2. Add the credentials to your `.env` file
3. Configure bucket policy for public access (see [API_DOCS.md](./API_DOCS.md) for details)

### AWS SES Configuration

For email verification functionality, you need to configure AWS SES:

1. **Verify your sender email** in AWS SES Console
   - Go to AWS SES → Verified Identities
   - Verify the email address you'll use as sender
2. Add SES credentials to your `.env` file
3. For production, request to move SES out of sandbox mode

## Development Guidelines

1. **Code Style** - Follow TypeScript best practices
2. **Error Handling** - Always use try-catch and custom errors
3. **Validation** - Validate all inputs using Joi
4. **Authentication** - Protect routes with auth middleware
5. **Testing** - Write unit and integration tests
6. **Documentation** - Document all endpoints and functions

## Production Deployment

1. Build the project:
```bash
npm run build
```

2. Set environment variables for production

3. Start the server:
```bash
npm run start:prod
```

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
