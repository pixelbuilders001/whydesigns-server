/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API server is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with USER role
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and receive JWT tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token received during login
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refreshToken:
 *                       type: string
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate user's refresh token
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Get authenticated user's profile information
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/profile:
 *   patch:
 *     summary: Update user profile
 *     description: Update authenticated user's profile information. Requires email OR phone verification.
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               address:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/profile/upload:
 *   put:
 *     summary: Update profile with image upload
 *     description: Update user profile with profile picture upload to AWS S3. Requires email OR phone verification.
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *                 description: Profile picture image (JPEG, PNG, GIF, WebP - max 5MB)
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid file type or size
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/change-password:
 *   post:
 *     summary: Change password
 *     description: Change authenticated user's password. Requires email OR phone verification.
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Invalid current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/verify-email:
 *   post:
 *     summary: Verify email with OTP (Public)
 *     description: |
 *       Verify user's email address using 6-digit OTP sent during registration.
 *       This endpoint supports both authenticated and public access:
 *       - If you have a Bearer token: Just provide the OTP (email is optional)
 *       - If you don't have a token: Provide both OTP and email address
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 length: 6
 *                 pattern: '^[0-9]{6}$'
 *                 description: 6-digit OTP sent to email
 *                 example: '123456'
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Required if not authenticated. Optional if you have a Bearer token.
 *                 example: 'user@example.com'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid or expired OTP, or email already verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/resend-otp:
 *   post:
 *     summary: Resend OTP (Public)
 *     description: |
 *       Resend email verification OTP. Can only be requested once per minute.
 *       This endpoint supports both authenticated and public access:
 *       - If you have a Bearer token: Email is optional, uses token to identify user
 *       - If you don't have a token: Provide email address in request body
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *       - {}
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Required if not authenticated. Optional if you have a Bearer token.
 *                 example: 'user@example.com'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Email already verified, rate limit exceeded, or missing email/userId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/verify-phone:
 *   post:
 *     summary: Verify phone
 *     description: Mark user's phone as verified
 *     tags: [User Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Phone verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Get paginated list of all users with filtering and sorting options. Requires email OR phone verification.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, email, phone
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *           enum: [google, facebook, local]
 *         description: Filter by auth provider
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     description: Get a specific user's details by their ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user (Admin only)
 *     description: Update any user's information
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               address:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: uri
 *               isActive:
 *                 type: boolean
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     description: Permanently delete a user account
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/{id}/deactivate:
 *   post:
 *     summary: Deactivate user (Admin only)
 *     description: Soft delete a user account (set isActive to false)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// ============= Category API Documentation =============

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all categories
 *     description: Get paginated list of all active categories. Admins can include inactive categories.
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in category name and description
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive categories (Admin only)
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       description:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       createdBy:
 *                         type: object
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Get a specific category's details by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /categories/slug/{slug}:
 *   get:
 *     summary: Get category by slug
 *     description: Get a specific category's details by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create category (Admin only)
 *     description: Create a new blog category. Requires admin role and verification.
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               slug:
 *                 type: string
 *                 pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$'
 *                 description: Auto-generated from name if not provided
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       409:
 *         description: Category name or slug already exists
 */

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update category (Admin only)
 *     description: Update an existing category
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category (Admin only)
 *     description: Permanently delete a category
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Category not found
 */

// ============= Blog API Documentation =============

/**
 * @swagger
 * /blogs:
 *   get:
 *     summary: Get all published blogs
 *     description: Get paginated list of all published blogs (public access)
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 */

/**
 * @swagger
 * /blogs/my-blogs:
 *   get:
 *     summary: Get my blogs
 *     description: Get authenticated user's blogs including drafts. Requires verification.
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: Your blogs retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /blogs/search:
 *   get:
 *     summary: Search blogs
 *     description: Search published blogs by title, content, excerpt, or tags
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 */

/**
 * @swagger
 * /blogs/author/{authorId}:
 *   get:
 *     summary: Get blogs by author
 *     description: Get all published blogs by a specific author
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 */

/**
 * @swagger
 * /blogs/most-viewed:
 *   get:
 *     summary: Get most viewed blogs
 *     description: Get the most viewed published blogs
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Most viewed blogs retrieved successfully
 */

/**
 * @swagger
 * /blogs/recent:
 *   get:
 *     summary: Get recent blogs
 *     description: Get the most recently published blogs
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent blogs retrieved successfully
 */

/**
 * @swagger
 * /blogs/tags:
 *   get:
 *     summary: Get all tags
 *     description: Get list of all unique tags used in published blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 */

/**
 * @swagger
 * /blogs:
 *   post:
 *     summary: Create blog
 *     description: Create a new blog post with optional featured image upload to AWS S3. Requires authentication and verification.
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               featuredImage:
 *                 type: string
 *                 format: binary
 *                 description: Featured image file (JPEG, PNG, GIF, WebP - max 5MB)
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *               slug:
 *                 type: string
 *                 description: Auto-generated from title if not provided
 *               content:
 *                 type: string
 *                 minLength: 50
 *               excerpt:
 *                 type: string
 *                 maxLength: 500
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags (e.g., "javascript,nodejs,express") - max 10 tags
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *                 default: draft
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     description: Get a specific blog by ID. Published blogs are public, drafts only visible to author/admin
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       403:
 *         description: Blog not published yet
 *       404:
 *         description: Blog not found
 */

/**
 * @swagger
 * /blogs/slug/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     description: Get a specific blog by slug
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       404:
 *         description: Blog not found
 */

/**
 * @swagger
 * /blogs/{id}:
 *   patch:
 *     summary: Update blog
 *     description: Update blog with optional featured image upload to AWS S3. Only author or admin can update. Old featured image will be deleted when uploading a new one.
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               featuredImage:
 *                 type: string
 *                 format: binary
 *                 description: Featured image file (JPEG, PNG, GIF, WebP - max 5MB)
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags (e.g., "javascript,nodejs,express") - max 10 tags
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Blog not found
 */

/**
 * @swagger
 * /blogs/{id}/publish:
 *   post:
 *     summary: Publish blog
 *     description: Change blog status to published. Only author or admin can publish.
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog published successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Blog not found
 */

/**
 * @swagger
 * /blogs/{id}:
 *   delete:
 *     summary: Delete blog
 *     description: Permanently delete a blog. Only author or admin can delete.
 *     tags: [Blogs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Blog not found
 */

// ============= Counselor API Documentation =============

/**
 * @swagger
 * /counselors:
 *   get:
 *     summary: Get all counselors
 *     description: Get paginated list of all active counselors. Supports search and filtering by specialty.
 *     tags: [Counselors]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in counselor name, bio, title, and specialties
 *       - in: query
 *         name: specialty
 *         schema:
 *           type: string
 *         description: Filter by specialty
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive counselors (Admin only)
 *     responses:
 *       200:
 *         description: Counselors retrieved successfully
 */

/**
 * @swagger
 * /counselors/top-rated:
 *   get:
 *     summary: Get top rated counselors
 *     description: Get the highest rated counselors
 *     tags: [Counselors]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of counselors to return
 *     responses:
 *       200:
 *         description: Top rated counselors retrieved successfully
 */

/**
 * @swagger
 * /counselors/most-experienced:
 *   get:
 *     summary: Get most experienced counselors
 *     description: Get counselors with the most years of experience
 *     tags: [Counselors]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of counselors to return
 *     responses:
 *       200:
 *         description: Most experienced counselors retrieved successfully
 */

/**
 * @swagger
 * /counselors/specialties:
 *   get:
 *     summary: Get all specialties
 *     description: Get list of all unique specialties from active counselors
 *     tags: [Counselors]
 *     responses:
 *       200:
 *         description: Specialties retrieved successfully
 */

/**
 * @swagger
 * /counselors/stats/overview:
 *   get:
 *     summary: Get counselor statistics (Admin only)
 *     description: Get overview statistics for counselors. Requires admin role and verification.
 *     tags: [Counselors]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /counselors/{id}:
 *   get:
 *     summary: Get counselor by ID
 *     description: Get a specific counselor's details by their numeric ID
 *     tags: [Counselors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Counselor ID (numeric)
 *     responses:
 *       200:
 *         description: Counselor retrieved successfully
 *       400:
 *         description: Invalid counselor ID
 *       404:
 *         description: Counselor not found
 */

/**
 * @swagger
 * /counselors:
 *   post:
 *     summary: Create counselor (Admin only)
 *     description: Create a new counselor. Requires admin role and verification.
 *     tags: [Counselors]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - title
 *               - yearsOfExperience
 *               - bio
 *               - specialties
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: Dr. John Smith
 *               title:
 *                 type: string
 *                 maxLength: 100
 *                 example: Licensed Clinical Psychologist
 *               yearsOfExperience:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 example: 15
 *               bio:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 example: Experienced psychologist specializing in cognitive behavioral therapy...
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/avatar.jpg
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 maxItems: 20
 *                 example: [Anxiety, Depression, CBT]
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 default: 0
 *                 example: 4.5
 *     responses:
 *       201:
 *         description: Counselor created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /counselors/{id}:
 *   patch:
 *     summary: Update counselor (Admin only)
 *     description: Update an existing counselor
 *     tags: [Counselors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Counselor ID (numeric)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               title:
 *                 type: string
 *               yearsOfExperience:
 *                 type: integer
 *               bio:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Counselor updated successfully
 *       400:
 *         description: Invalid counselor ID or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Counselor not found
 */

/**
 * @swagger
 * /counselors/{id}/rating:
 *   patch:
 *     summary: Update counselor rating (Admin only)
 *     description: Update a counselor's rating
 *     tags: [Counselors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Counselor ID (numeric)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 5
 *                 example: 4.5
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *       400:
 *         description: Invalid rating value
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Counselor not found
 */

/**
 * @swagger
 * /counselors/{id}:
 *   delete:
 *     summary: Delete counselor (Admin only)
 *     description: Permanently delete a counselor
 *     tags: [Counselors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Counselor ID (numeric)
 *     responses:
 *       200:
 *         description: Counselor deleted successfully
 *       400:
 *         description: Invalid counselor ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Counselor not found
 */

/**
 * @swagger
 * /counselors/{id}/deactivate:
 *   post:
 *     summary: Deactivate counselor (Admin only)
 *     description: Soft delete a counselor (set isActive to false)
 *     tags: [Counselors]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Counselor ID (numeric)
 *     responses:
 *       200:
 *         description: Counselor deactivated successfully
 *       400:
 *         description: Invalid counselor ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Counselor not found
 */

export {};
