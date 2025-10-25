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
 * /users/forgot-password:
 *   post:
 *     summary: Forgot password (Public)
 *     description: |
 *       Request a password reset OTP. A 6-digit OTP will be sent to the provided email address if it exists in the system.
 *
 *       **Security Features:**
 *       - Does not reveal whether email exists (prevents email enumeration)
 *       - Only works for local accounts (not social login accounts)
 *       - Inactive accounts cannot reset password
 *       - OTP expires in 5 minutes
 *       - Rate limited to 1 request per minute per user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Success response (always returned for security)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: If the email exists in our system, a password reset OTP has been sent. Please check your email.
 *               data: null
 *       400:
 *         description: Account is deactivated or registered with social login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     summary: Reset password with OTP (Public)
 *     description: |
 *       Reset user password using the OTP received via email.
 *
 *       **Security Features:**
 *       - Requires valid 6-digit OTP
 *       - OTP must not be expired (5 minutes validity)
 *       - OTP can only be used once
 *       - All active sessions are invalidated after password reset
 *       - Password change confirmation email is sent
 *       - Only works for local accounts
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 length: 6
 *                 pattern: '^[0-9]{6}$'
 *                 example: '123456'
 *                 description: 6-digit OTP received via email
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: newPassword123
 *               confirmPassword:
 *                 type: string
 *                 example: newPassword123
 *                 description: Must match newPassword
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Password reset successfully. Please log in with your new password.
 *               data: null
 *       400:
 *         description: Invalid or expired OTP, passwords don't match, or account registered with social login
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
 *     summary: Get all blogs
 *     description: Get paginated list of blogs with optional filters (public access)
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
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status. If not provided, returns all items. If true, returns only active items. If false, returns only inactive items.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by blog status (draft, published, etc.)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering blogs
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
 *     description: Get paginated list of counselors with optional filters. Supports search and filtering by specialty and active status.
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status. If not provided, returns all items. If true, returns only active items. If false, returns only inactive items.
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

// ============= Booking API Documentation =============

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a booking (Public)
 *     description: |
 *       Create a new counseling session booking. Available to both logged-in users and guests.
 *
 *       **Two-Stage Email Workflow:**
 *       - Upon booking creation, guest receives a "Pending Approval" email (without meeting link)
 *       - Admin must confirm the booking with a meeting link to send the "Approval" email
 *     tags: [Bookings]
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
 *               - counselorId
 *               - guestName
 *               - guestEmail
 *               - guestPhone
 *               - bookingDate
 *               - bookingTime
 *               - discussionTopic
 *             properties:
 *               counselorId:
 *                 type: string
 *                 description: MongoDB ObjectId of the counselor
 *                 example: 507f1f77bcf86cd799439011
 *               guestName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: John Doe
 *               guestEmail:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               guestPhone:
 *                 type: string
 *                 example: +1234567890
 *               bookingDate:
 *                 type: string
 *                 format: date
 *                 description: Must be a future date
 *                 example: 2025-11-01
 *               bookingTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *                 description: Time in HH:MM format (24-hour)
 *                 example: 14:30
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 240
 *                 default: 60
 *                 description: Duration in minutes
 *                 example: 60
 *               discussionTopic:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *                 example: Seeking help with anxiety management and stress coping strategies
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error or time slot not available
 *       404:
 *         description: Counselor not found
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     description: Get paginated list of all bookings. Requires admin role and verification.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
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
 *           maximum: 100
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: bookingDate
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID (Public)
 *     description: Get a specific booking's details by ID
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /bookings/email:
 *   get:
 *     summary: Get bookings by email (Public)
 *     description: Get all bookings for a specific email address. Useful for guest users to check their bookings.
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
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
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 */

/**
 * @swagger
 * /bookings/status:
 *   get:
 *     summary: Get bookings by status (Admin only)
 *     description: Get all bookings filtered by status
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed, no-show]
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
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /bookings/upcoming:
 *   get:
 *     summary: Get upcoming bookings (Admin only)
 *     description: Get all upcoming confirmed bookings
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *     responses:
 *       200:
 *         description: Upcoming bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /bookings/upcoming/email:
 *   get:
 *     summary: Get upcoming bookings by email (Public)
 *     description: Get upcoming bookings for a specific email address
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Upcoming bookings retrieved successfully
 */

/**
 * @swagger
 * /bookings/user/{userId}:
 *   get:
 *     summary: Get bookings by user
 *     description: Get all bookings for a specific user. Users can only view their own bookings unless they're admin.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: User bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only view own bookings
 */

/**
 * @swagger
 * /bookings/user/{userId}/upcoming:
 *   get:
 *     summary: Get upcoming bookings by user
 *     description: Get upcoming bookings for a specific user
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upcoming bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /bookings/counselor/{counselorId}:
 *   get:
 *     summary: Get bookings by counselor (Admin only)
 *     description: Get all bookings for a specific counselor
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: counselorId
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Counselor bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /bookings/counselor/{counselorId}/upcoming:
 *   get:
 *     summary: Get upcoming bookings by counselor (Admin only)
 *     description: Get upcoming bookings for a specific counselor
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: counselorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upcoming counselor bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /bookings/counselor/{counselorId}/date:
 *   get:
 *     summary: Get counselor bookings for specific date (Admin only)
 *     description: Get all bookings for a counselor on a specific date. Useful for checking availability.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: counselorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2025-11-01
 *     responses:
 *       200:
 *         description: Counselor bookings for date retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /bookings/stats:
 *   get:
 *     summary: Get booking statistics (Admin only)
 *     description: Get overall booking statistics including counts by status
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /bookings/{id}:
 *   patch:
 *     summary: Update booking (Admin only)
 *     description: Update booking details. Cannot update cancelled or completed bookings.
 *     tags: [Bookings]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingDate:
 *                 type: string
 *                 format: date
 *               bookingTime:
 *                 type: string
 *                 pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *               duration:
 *                 type: integer
 *                 minimum: 15
 *                 maximum: 240
 *               discussionTopic:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 500
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed, no-show]
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Cannot update cancelled/completed bookings or time slot not available
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /bookings/{id}/confirm:
 *   patch:
 *     summary: Confirm booking with meeting link (Admin only)
 *     description: |
 *       Change booking status from pending to confirmed and provide a meeting link.
 *       This triggers an approval email to the guest with the meeting link and calendar invite (.ics file).
 *
 *       **Two-Stage Email Workflow:**
 *       - Stage 1: User creates booking → receives "Pending Approval" email (no meeting link)
 *       - Stage 2: Admin confirms with meeting link → user receives "Approval" email (with meeting link)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - meetingLink
 *             properties:
 *               meetingLink:
 *                 type: string
 *                 format: uri
 *                 description: The meeting link for the counseling session (e.g., Google Meet, Zoom, etc.)
 *                 example: https://meet.google.com/abc-defg-hij
 *     responses:
 *       200:
 *         description: Booking confirmed and approval email sent to guest
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
 *                   example: Booking confirmed and approval email sent to guest
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: confirmed
 *                     meetingLink:
 *                       type: string
 *                       example: https://meet.google.com/abc-defg-hij
 *       400:
 *         description: Only pending bookings can be confirmed or meeting link is missing/invalid
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel booking (Admin only)
 *     description: Cancel a booking. Google Calendar event will be deleted and cancellation email sent.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cancelledBy
 *             properties:
 *               cancellationReason:
 *                 type: string
 *                 maxLength: 500
 *                 example: Emergency situation
 *               cancelledBy:
 *                 type: string
 *                 enum: [user, admin, counselor]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Booking already cancelled or cannot cancel completed bookings
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /bookings/{id}/complete:
 *   patch:
 *     summary: Mark booking as completed (Admin only)
 *     description: Change booking status to completed. Only confirmed bookings can be marked as completed.
 *     tags: [Bookings]
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
 *         description: Booking marked as completed
 *       400:
 *         description: Only confirmed bookings can be marked as completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /bookings/{id}/no-show:
 *   patch:
 *     summary: Mark booking as no-show (Admin only)
 *     description: Change booking status to no-show when client doesn't show up
 *     tags: [Bookings]
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
 *         description: Booking marked as no-show
 *       400:
 *         description: Only confirmed bookings can be marked as no-show
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete booking (Admin only)
 *     description: Permanently delete a booking. Google Calendar event will be cancelled.
 *     tags: [Bookings]
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
 *         description: Booking deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /bookings/send-reminders:
 *   post:
 *     summary: Send booking reminders (Admin only)
 *     description: Manually trigger sending reminder emails for upcoming bookings. Typically called by a cron job.
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Booking reminders sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

// ============= Materials API Documentation =============

/**
 * @swagger
 * /materials:
 *   get:
 *     summary: Get all materials
 *     description: Get paginated list of materials with optional filters. Public access - anyone can view and download materials.
 *     tags: [Materials]
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
 *           enum: [name, createdAt, updatedAt, downloadCount, fileSize, category]
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status. If not provided, returns all items. If true, returns only active items. If false, returns only inactive items.
 *     responses:
 *       200:
 *         description: Materials retrieved successfully
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
 *                     $ref: '#/components/schemas/Material'
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
 * /materials/search:
 *   get:
 *     summary: Search materials
 *     description: Search materials by name, description, category, or tags
 *     tags: [Materials]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *         description: Search query
 *         example: syllabus
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
 *         description: Search results retrieved successfully
 *       400:
 *         description: Search query is required
 */

/**
 * @swagger
 * /materials/meta/categories:
 *   get:
 *     summary: Get all categories
 *     description: Get list of all unique categories from active materials
 *     tags: [Materials]
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
 *                     type: string
 *                   example: [Academic, Resources, Templates, Guides]
 */

/**
 * @swagger
 * /materials/meta/tags:
 *   get:
 *     summary: Get all tags
 *     description: Get list of all unique tags used in active materials
 *     tags: [Materials]
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
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
 *                     type: string
 *                   example: [syllabus, 2024, course, template, guide]
 */

/**
 * @swagger
 * /materials/meta/stats:
 *   get:
 *     summary: Get category statistics
 *     description: Get material count by category
 *     tags: [Materials]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                       category:
 *                         type: string
 *                       count:
 *                         type: number
 */

/**
 * @swagger
 * /materials/category/{category}:
 *   get:
 *     summary: Get materials by category
 *     description: Get all materials in a specific category
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *         example: Academic
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
 *         description: Materials retrieved successfully
 *       400:
 *         description: Category is required
 */

/**
 * @swagger
 * /materials/{id}:
 *   get:
 *     summary: Get material by ID
 *     description: Get a specific material's details by ID
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material retrieved successfully
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
 *                   $ref: '#/components/schemas/Material'
 *       404:
 *         description: Material not found
 */

/**
 * @swagger
 * /materials/{id}/download:
 *   get:
 *     summary: Download material
 *     description: Track download and return material details with file URL. Public access.
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material download tracked successfully
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
 *                   $ref: '#/components/schemas/Material'
 *       404:
 *         description: Material not found
 */

/**
 * @swagger
 * /materials:
 *   post:
 *     summary: Create material (Admin only)
 *     description: |
 *       Upload a new material with file. Requires admin role and verification.
 *
 *       **Supported file types:**
 *       - PDF: application/pdf
 *       - MS Office: DOC, DOCX, XLS, XLSX, PPT, PPTX
 *       - Text: TXT, CSV
 *       - Archives: ZIP, RAR, 7Z
 *       - Images: JPEG, PNG, GIF, WebP
 *       - Other: JSON, XML
 *
 *       **Max file size:** 50MB
 *     tags: [Materials]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - name
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Material file (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ZIP, RAR, 7Z, images - max 50MB)
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *                 description: Material name
 *                 example: Course Syllabus 2024
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Material description
 *                 example: Comprehensive course syllabus for academic year 2024
 *               category:
 *                 type: string
 *                 maxLength: 100
 *                 description: Material category
 *                 example: Academic
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *                 description: Tags for categorization (max 10 tags)
 *                 example: [syllabus, 2024, course]
 *     responses:
 *       201:
 *         description: Material uploaded successfully
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
 *                   $ref: '#/components/schemas/Material'
 *       400:
 *         description: Invalid file type, size, or missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @swagger
 * /materials/{id}:
 *   patch:
 *     summary: Update material (Admin only)
 *     description: |
 *       Update material details and optionally replace the file.
 *       Old file will be deleted from S3 when uploading a new one.
 *     tags: [Materials]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: New material file (optional - only if replacing)
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               category:
 *                 type: string
 *                 maxLength: 100
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Material updated successfully
 *       400:
 *         description: Invalid file type or size
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Material not found
 */

/**
 * @swagger
 * /materials/{id}:
 *   delete:
 *     summary: Delete material (Admin only)
 *     description: Permanently delete a material. File will be deleted from S3.
 *     tags: [Materials]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Material not found
 */

/**
 * @swagger
 * /materials/{id}/deactivate:
 *   post:
 *     summary: Deactivate material (Admin only)
 *     description: Soft delete a material (set isActive to false). File remains in S3.
 *     tags: [Materials]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material deactivated successfully
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
 *                   $ref: '#/components/schemas/Material'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Material not found
 */

/**
 * @swagger
 * tags:
 *   name: Testimonials
 *   description: Testimonial management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Testimonial:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Testimonial ID
 *         userId:
 *           type: string
 *           description: User ID who created the testimonial
 *         name:
 *           type: string
 *           description: Name of the person giving testimonial
 *         email:
 *           type: string
 *           description: Email of the person
 *         city:
 *           type: string
 *           description: City
 *         state:
 *           type: string
 *           description: State
 *         country:
 *           type: string
 *           description: Country
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Rating (1-5 stars)
 *         message:
 *           type: string
 *           description: Testimonial message
 *         designation:
 *           type: string
 *           description: Job designation
 *         company:
 *           type: string
 *           description: Company name
 *         profileImage:
 *           type: string
 *           description: Profile image URL
 *         isFavorite:
 *           type: boolean
 *           description: Is this a favorite testimonial
 *         isApproved:
 *           type: boolean
 *           description: Is this testimonial approved
 *         isActive:
 *           type: boolean
 *           description: Is this testimonial active
 *         socialMedia:
 *           type: object
 *           properties:
 *             facebook:
 *               type: string
 *             instagram:
 *               type: string
 *             twitter:
 *               type: string
 *             linkedin:
 *               type: string
 *         displayOrder:
 *           type: number
 *           description: Display order for sorting
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         fullLocation:
 *           type: string
 *           description: Full location (virtual field)
 *     CreateTestimonialRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - city
 *         - state
 *         - rating
 *         - message
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         email:
 *           type: string
 *           format: email
 *         city:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         state:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         country:
 *           type: string
 *           maxLength: 100
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         message:
 *           type: string
 *           minLength: 10
 *           maxLength: 2000
 *         designation:
 *           type: string
 *           maxLength: 100
 *         company:
 *           type: string
 *           maxLength: 100
 *         profileImage:
 *           type: string
 *           format: uri
 *         socialMedia:
 *           type: object
 *           properties:
 *             facebook:
 *               type: string
 *             instagram:
 *               type: string
 *             twitter:
 *               type: string
 *             linkedin:
 *               type: string
 */

/**
 * @swagger
 * /testimonials:
 *   post:
 *     summary: Create a new testimonial
 *     description: Create a testimonial (public access - no authentication required). Testimonials require admin approval before being publicly visible.
 *     tags: [Testimonials]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - rating
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Name of the person giving testimonial
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               city:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: City name (optional)
 *               state:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: State name (optional)
 *               country:
 *                 type: string
 *                 maxLength: 100
 *                 description: Country name (optional, defaults to India)
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1-5 stars
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Testimonial message
 *               designation:
 *                 type: string
 *                 maxLength: 100
 *                 description: Job designation (optional)
 *               company:
 *                 type: string
 *                 maxLength: 100
 *                 description: Company name (optional)
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (optional)
 *               socialMedia.facebook:
 *                 type: string
 *                 description: Facebook profile URL (optional)
 *               socialMedia.instagram:
 *                 type: string
 *                 description: Instagram profile URL (optional)
 *               socialMedia.twitter:
 *                 type: string
 *                 description: Twitter/X profile URL (optional)
 *               socialMedia.linkedin:
 *                 type: string
 *                 description: LinkedIn profile URL (optional)
 *               displayOrder:
 *                 type: integer
 *                 description: Display order (optional, defaults to 0)
 *     responses:
 *       201:
 *         description: Testimonial created successfully
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
 *                   $ref: '#/components/schemas/Testimonial'
 *       400:
 *         description: Validation error
 *   get:
 *     summary: Get all testimonials with filters
 *     description: Get testimonials with optional filters (public access)
 *     tags: [Testimonials]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, rating, displayOrder, name]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: isApproved
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: isFavorite
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status. If not provided, returns all items. If true, returns only active items. If false, returns only inactive items.
 *     responses:
 *       200:
 *         description: Testimonials retrieved successfully
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
 *                     testimonials:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Testimonial'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */

/**
 * @swagger
 * /testimonials/approved:
 *   get:
 *     summary: Get approved testimonials
 *     description: Get all approved and active testimonials (public)
 *     tags: [Testimonials]
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
 *           enum: [createdAt, rating, displayOrder, name]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Approved testimonials retrieved successfully
 */

/**
 * @swagger
 * /testimonials/favorites:
 *   get:
 *     summary: Get favorite testimonials
 *     description: Get all favorite testimonials (public)
 *     tags: [Testimonials]
 *     parameters:
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
 *         description: Favorite testimonials retrieved successfully
 */

/**
 * @swagger
 * /testimonials/search:
 *   get:
 *     summary: Search testimonials
 *     description: Search testimonials by keyword (public)
 *     tags: [Testimonials]
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
 *       400:
 *         description: Search query required
 */

/**
 * @swagger
 * /testimonials/location:
 *   get:
 *     summary: Get testimonials by location
 *     description: Filter testimonials by city and/or state (public)
 *     tags: [Testimonials]
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
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
 *         description: Testimonials retrieved by location
 */

/**
 * @swagger
 * /testimonials/rating/{rating}:
 *   get:
 *     summary: Get testimonials by rating
 *     description: Filter testimonials by rating (public)
 *     tags: [Testimonials]
 *     parameters:
 *       - in: path
 *         name: rating
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
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
 *         description: Testimonials retrieved by rating
 *       400:
 *         description: Invalid rating
 */

/**
 * @swagger
 * /testimonials/{id}:
 *   get:
 *     summary: Get testimonial by ID
 *     description: Get a specific testimonial by ID (public)
 *     tags: [Testimonials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial retrieved successfully
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
 *                   $ref: '#/components/schemas/Testimonial'
 *       404:
 *         description: Testimonial not found
 *   patch:
 *     summary: Update testimonial
 *     description: Update a testimonial (owner or admin only)
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
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
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Name of the person giving testimonial
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               city:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: City name
 *               state:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: State name
 *               country:
 *                 type: string
 *                 maxLength: 100
 *                 description: Country name
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating from 1-5 stars
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Testimonial message
 *               designation:
 *                 type: string
 *                 maxLength: 100
 *                 description: Job designation
 *               company:
 *                 type: string
 *                 maxLength: 100
 *                 description: Company name
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file (optional, replaces existing if provided)
 *               socialMedia.facebook:
 *                 type: string
 *                 description: Facebook profile URL
 *               socialMedia.instagram:
 *                 type: string
 *                 description: Instagram profile URL
 *               socialMedia.twitter:
 *                 type: string
 *                 description: Twitter/X profile URL
 *               socialMedia.linkedin:
 *                 type: string
 *                 description: LinkedIn profile URL
 *               displayOrder:
 *                 type: integer
 *                 description: Display order
 *     responses:
 *       200:
 *         description: Testimonial updated successfully
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
 *                   $ref: '#/components/schemas/Testimonial'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Testimonial not found
 *   delete:
 *     summary: Delete testimonial
 *     description: Delete a testimonial (owner or admin only)
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Testimonial not found
 */

/**
 * @swagger
 * /testimonials/my/testimonials:
 *   get:
 *     summary: Get current user's testimonials
 *     description: Get all testimonials created by the authenticated user
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User testimonials retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /testimonials/{id}/deactivate:
 *   post:
 *     summary: Deactivate testimonial
 *     description: Soft delete a testimonial (owner or admin only)
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Testimonial not found
 */

/**
 * @swagger
 * /testimonials/stats/overview:
 *   get:
 *     summary: Get testimonial statistics
 *     description: Get overall testimonial statistics (admin only)
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     total:
 *                       type: integer
 *                     approved:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     favorites:
 *                       type: integer
 *                     averageRating:
 *                       type: number
 *                     ratingDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */

/**
 * @swagger
 * /testimonials/{id}/favorite:
 *   patch:
 *     summary: Toggle favorite status
 *     description: Mark or unmark testimonial as favorite (admin only)
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Testimonial not found
 */

/**
 * @swagger
 * /testimonials/{id}/approve:
 *   patch:
 *     summary: Approve testimonial
 *     description: Approve a pending testimonial (admin only)
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Testimonial not found
 */

/**
 * @swagger
 * /testimonials/{id}/reject:
 *   patch:
 *     summary: Reject testimonial
 *     description: Reject a testimonial (admin only)
 *     tags: [Testimonials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Testimonial not found
 */

/**
 * @swagger
 * /reels:
 *   get:
 *     summary: Get published reels
 *     description: Retrieve all published and active reels with pagination and filtering
 *     tags: [Reels]
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
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, publishedAt, viewCount, likeCount]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Reels retrieved successfully
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
 *                     $ref: '#/components/schemas/Reel'
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
 * /reels/search:
 *   get:
 *     summary: Search reels
 *     description: Search reels by title, description, or tags
 *     tags: [Reels]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
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
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
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
 *                     $ref: '#/components/schemas/Reel'
 */

/**
 * @swagger
 * /reels/trending/most-viewed:
 *   get:
 *     summary: Get most viewed reels
 *     description: Retrieve reels sorted by view count
 *     tags: [Reels]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reels to retrieve
 *     responses:
 *       200:
 *         description: Most viewed reels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reel'
 */

/**
 * @swagger
 * /reels/trending/most-liked:
 *   get:
 *     summary: Get most liked reels
 *     description: Retrieve reels sorted by like count
 *     tags: [Reels]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reels to retrieve
 *     responses:
 *       200:
 *         description: Most liked reels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reel'
 */

/**
 * @swagger
 * /reels/trending/recent:
 *   get:
 *     summary: Get recent reels
 *     description: Retrieve recently published reels
 *     tags: [Reels]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of reels to retrieve
 *     responses:
 *       200:
 *         description: Recent reels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reel'
 */

/**
 * @swagger
 * /reels/meta/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve list of all unique reel categories
 *     tags: [Reels]
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */

/**
 * @swagger
 * /reels/meta/tags:
 *   get:
 *     summary: Get all tags
 *     description: Retrieve list of all unique reel tags
 *     tags: [Reels]
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */

/**
 * @swagger
 * /reels/category/{category}:
 *   get:
 *     summary: Get reels by category
 *     description: Retrieve reels filtered by specific category
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
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
 *     responses:
 *       200:
 *         description: Reels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reel'
 *       404:
 *         description: No reels found for this category
 */

/**
 * @swagger
 * /reels/tags:
 *   get:
 *     summary: Get reels by tags
 *     description: Retrieve reels filtered by one or more tags
 *     tags: [Reels]
 *     parameters:
 *       - in: query
 *         name: tags
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Comma-separated list of tags
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
 *     responses:
 *       200:
 *         description: Reels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reel'
 */

/**
 * @swagger
 * /reels/{id}:
 *   get:
 *     summary: Get reel by ID
 *     description: Retrieve a specific reel by its ID
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Reel'
 *       404:
 *         description: Reel not found
 */

/**
 * @swagger
 * /reels/{id}/view:
 *   post:
 *     summary: Increment view count
 *     description: Increment the view count for a specific reel
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: View count incremented successfully
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
 *                     viewCount:
 *                       type: integer
 *       404:
 *         description: Reel not found
 */

/**
 * @swagger
 * /reels/{id}/like:
 *   post:
 *     summary: Like reel
 *     description: Increment the like count for a specific reel
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel liked successfully
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
 *                     likeCount:
 *                       type: integer
 *       404:
 *         description: Reel not found
 */

/**
 * @swagger
 * /reels/{id}/unlike:
 *   post:
 *     summary: Unlike reel
 *     description: Decrement the like count for a specific reel
 *     tags: [Reels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel unliked successfully
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
 *                     likeCount:
 *                       type: integer
 *       404:
 *         description: Reel not found
 */

/**
 * @swagger
 * /reels:
 *   post:
 *     summary: Create reel (Admin only)
 *     description: Upload and create a new reel with video and optional thumbnail
 *     tags: [Reels]
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
 *               - duration
 *               - video
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *                 description: Reel title
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Reel description
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 180
 *                 description: Video duration in seconds
 *               category:
 *                 type: string
 *                 maxLength: 50
 *                 description: Reel category
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags (max 10)
 *               displayOrder:
 *                 type: integer
 *                 description: Display order for sorting
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file (required)
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image (optional)
 *     responses:
 *       201:
 *         description: Reel created successfully
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
 *                   $ref: '#/components/schemas/Reel'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */

/**
 * @swagger
 * /reels/all/reels:
 *   get:
 *     summary: Get all reels (Admin only)
 *     description: Retrieve all reels with optional filters (admin access)
 *     tags: [Reels]
 *     security:
 *       - BearerAuth: []
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status. If not provided, returns all items. If true, returns only active items. If false, returns only inactive items.
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering reels
 *     responses:
 *       200:
 *         description: All reels retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reel'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */

/**
 * @swagger
 * /reels/stats/overview:
 *   get:
 *     summary: Get reel statistics (Admin only)
 *     description: Retrieve comprehensive statistics about reels
 *     tags: [Reels]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalReels:
 *                       type: integer
 *                     publishedReels:
 *                       type: integer
 *                     unpublishedReels:
 *                       type: integer
 *                     totalViews:
 *                       type: integer
 *                     totalLikes:
 *                       type: integer
 *                     averageViews:
 *                       type: number
 *                     averageLikes:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */

/**
 * @swagger
 * /reels/{id}:
 *   patch:
 *     summary: Update reel (Admin only)
 *     description: Update an existing reel's details and optionally replace video/thumbnail
 *     tags: [Reels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 180
 *               category:
 *                 type: string
 *                 maxLength: 50
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               displayOrder:
 *                 type: integer
 *               video:
 *                 type: string
 *                 format: binary
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Reel updated successfully
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
 *                   $ref: '#/components/schemas/Reel'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Reel not found
 */

/**
 * @swagger
 * /reels/{id}/publish:
 *   patch:
 *     summary: Publish reel (Admin only)
 *     description: Mark a reel as published and set publication timestamp
 *     tags: [Reels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel published successfully
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
 *                   $ref: '#/components/schemas/Reel'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Reel not found
 */

/**
 * @swagger
 * /reels/{id}/unpublish:
 *   patch:
 *     summary: Unpublish reel (Admin only)
 *     description: Mark a reel as unpublished
 *     tags: [Reels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel unpublished successfully
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
 *                   $ref: '#/components/schemas/Reel'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Reel not found
 */

/**
 * @swagger
 * /reels/{id}/deactivate:
 *   post:
 *     summary: Deactivate reel (Admin only)
 *     description: Mark a reel as inactive (soft delete)
 *     tags: [Reels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Reel not found
 */

/**
 * @swagger
 * /reels/{id}:
 *   delete:
 *     summary: Delete reel (Admin only)
 *     description: Permanently delete a reel and its associated files
 *     tags: [Reels]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Reel ID
 *     responses:
 *       200:
 *         description: Reel deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Reel not found
 */


// ============================================================================
// VIDEOS
// ============================================================================

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get published videos
 *     description: Retrieve all published and active videos with pagination and filtering
 *     tags: [Videos]
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
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, publishedAt, viewCount, likeCount]
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
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
 *                     $ref: '#/components/schemas/Video'
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
 * /videos/search:
 *   get:
 *     summary: Search videos
 *     description: Search videos by title, description, or tags
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
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
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
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
 *                     $ref: '#/components/schemas/Video'
 */

/**
 * @swagger
 * /videos/trending/most-viewed:
 *   get:
 *     summary: Get most viewed videos
 *     description: Retrieve videos sorted by view count
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of videos to retrieve
 *     responses:
 *       200:
 *         description: Most viewed videos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 */

/**
 * @swagger
 * /videos/trending/most-liked:
 *   get:
 *     summary: Get most liked videos
 *     description: Retrieve videos sorted by like count
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of videos to retrieve
 *     responses:
 *       200:
 *         description: Most liked videos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 */

/**
 * @swagger
 * /videos/trending/recent:
 *   get:
 *     summary: Get recent videos
 *     description: Retrieve recently published videos
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of videos to retrieve
 *     responses:
 *       200:
 *         description: Recent videos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 */

/**
 * @swagger
 * /videos/meta/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieve list of all unique video categories
 *     tags: [Videos]
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */

/**
 * @swagger
 * /videos/meta/tags:
 *   get:
 *     summary: Get all tags
 *     description: Retrieve list of all unique video tags
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */

/**
 * @swagger
 * /videos/category/{category}:
 *   get:
 *     summary: Get videos by category
 *     description: Retrieve videos filtered by specific category
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
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
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 *       404:
 *         description: No videos found for this category
 */

/**
 * @swagger
 * /videos/tags:
 *   get:
 *     summary: Get videos by tags
 *     description: Retrieve videos filtered by one or more tags
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: tags
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Comma-separated list of tags
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
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 */

/**
 * @swagger
 * /videos/{id}:
 *   get:
 *     summary: Get video by ID
 *     description: Retrieve a specific video by its ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 */

/**
 * @swagger
 * /videos/{id}/view:
 *   post:
 *     summary: Increment view count
 *     description: Increment the view count for a specific video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: View count incremented successfully
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
 *                     viewCount:
 *                       type: integer
 *       404:
 *         description: Video not found
 */

/**
 * @swagger
 * /videos/{id}/like:
 *   post:
 *     summary: Like video
 *     description: Increment the like count for a specific video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video liked successfully
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
 *                     likeCount:
 *                       type: integer
 *       404:
 *         description: Video not found
 */

/**
 * @swagger
 * /videos/{id}/unlike:
 *   post:
 *     summary: Unlike video
 *     description: Decrement the like count for a specific video
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video unliked successfully
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
 *                     likeCount:
 *                       type: integer
 *       404:
 *         description: Video not found
 */

/**
 * @swagger
 * /videos:
 *   post:
 *     summary: Create video (Admin only)
 *     description: Upload and create a new video with video and optional thumbnail
 *     tags: [Videos]
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
 *               - duration
 *               - video
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *                 description: Video title
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Video description
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 description: Video duration in seconds
 *               category:
 *                 type: string
 *                 maxLength: 50
 *                 description: Video category
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags (max 20)
 *               displayOrder:
 *                 type: integer
 *                 description: Display order for sorting
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file (required)
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: Thumbnail image (optional)
 *     responses:
 *       201:
 *         description: Video created successfully
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
 *                   $ref: '#/components/schemas/Video'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */

/**
 * @swagger
 * /videos/all/videos:
 *   get:
 *     summary: Get all videos (Admin only)
 *     description: Retrieve all videos with optional filters (admin access)
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status. If not provided, returns all items. If true, returns only active items. If false, returns only inactive items.
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering videos
 *     responses:
 *       200:
 *         description: All videos retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */

/**
 * @swagger
 * /videos/stats/overview:
 *   get:
 *     summary: Get video statistics (Admin only)
 *     description: Retrieve comprehensive statistics about videos
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalVideos:
 *                       type: integer
 *                     publishedVideos:
 *                       type: integer
 *                     unpublishedVideos:
 *                       type: integer
 *                     totalViews:
 *                       type: integer
 *                     totalLikes:
 *                       type: integer
 *                     averageViews:
 *                       type: number
 *                     averageLikes:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */

/**
 * @swagger
 * /videos/{id}:
 *   patch:
 *     summary: Update video (Admin only)
 *     description: Update an existing video's details and optionally replace video/thumbnail
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               duration:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 180
 *               category:
 *                 type: string
 *                 maxLength: 50
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               displayOrder:
 *                 type: integer
 *               video:
 *                 type: string
 *                 format: binary
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video updated successfully
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
 *                   $ref: '#/components/schemas/Video'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Video not found
 */

/**
 * @swagger
 * /videos/{id}/publish:
 *   patch:
 *     summary: Publish video (Admin only)
 *     description: Mark a video as published and set publication timestamp
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video published successfully
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
 *                   $ref: '#/components/schemas/Video'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Video not found
 */

/**
 * @swagger
 * /videos/{id}/unpublish:
 *   patch:
 *     summary: Unpublish video (Admin only)
 *     description: Mark a video as unpublished
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video unpublished successfully
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
 *                   $ref: '#/components/schemas/Video'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Video not found
 */

/**
 * @swagger
 * /videos/{id}/deactivate:
 *   post:
 *     summary: Deactivate video (Admin only)
 *     description: Mark a video as inactive (soft delete)
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Video not found
 */

/**
 * @swagger
 * /videos/{id}:
 *   delete:
 *     summary: Delete video (Admin only)
 *     description: Permanently delete a video and its associated files
 *     tags: [Videos]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Video not found
 */


// ============================================================================
// LEADS
// ============================================================================

/**
 * @swagger
 * /leads:
 *   post:
 *     summary: Create a new lead
 *     description: Create a new lead (Public endpoint for lead generation forms)
 *     tags: [Leads]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - areaOfInterest
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               areaOfInterest:
 *                 type: string
 *                 maxLength: 200
 *                 example: Web Design
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *                 example: I would like to know more about your design courses
 *     responses:
 *       201:
 *         description: Lead created successfully
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
 *                   $ref: '#/components/schemas/Lead'
 *       400:
 *         description: Validation error or email already exists
 */

/**
 * @swagger
 * /leads:
 *   get:
 *     summary: Get all leads (Admin only)
 *     description: Retrieve all leads with filtering and pagination
 *     tags: [Leads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, fullName, email, areaOfInterest]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: areaOfInterest
 *         schema:
 *           type: string
 *         description: Filter by area of interest
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in fullName and areaOfInterest
 *     responses:
 *       200:
 *         description: Leads retrieved successfully
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
 *                     leads:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Lead'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */

/**
 * @swagger
 * /leads/stats/overview:
 *   get:
 *     summary: Get lead statistics (Admin only)
 *     description: Get statistics about leads (total, active, inactive)
 *     tags: [Leads]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
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
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     active:
 *                       type: integer
 *                       example: 85
 *                     inactive:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */

/**
 * @swagger
 * /leads/{id}:
 *   get:
 *     summary: Get lead by ID (Admin only)
 *     description: Retrieve a single lead by ID
 *     tags: [Leads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead ID
 *     responses:
 *       200:
 *         description: Lead retrieved successfully
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
 *                   $ref: '#/components/schemas/Lead'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Lead not found
 */

/**
 * @swagger
 * /leads/{id}:
 *   put:
 *     summary: Update lead (Admin only)
 *     description: Update a lead's information
 *     tags: [Leads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               areaOfInterest:
 *                 type: string
 *                 maxLength: 200
 *                 example: Web Design
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *                 example: I would like to know more about your design courses
 *     responses:
 *       200:
 *         description: Lead updated successfully
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
 *                   $ref: '#/components/schemas/Lead'
 *       400:
 *         description: Validation error or email already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Lead not found
 */

/**
 * @swagger
 * /leads/{id}:
 *   delete:
 *     summary: Delete lead (Admin only)
 *     description: Permanently delete a lead
 *     tags: [Leads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead ID
 *     responses:
 *       200:
 *         description: Lead deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Lead not found
 */

/**
 * @swagger
 * /leads/{id}/status:
 *   patch:
 *     summary: Update lead active status (Admin only)
 *     description: Update the isActive status of a lead
 *     tags: [Leads]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lead ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Lead status updated successfully
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
 *                   $ref: '#/components/schemas/Lead'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Lead not found
 */

export {};
// ============================================================================
// SUMMARY
// ============================================================================

/**
 * @swagger
 * /summary/dashboard:
 *   get:
 *     summary: Get dashboard summary (Admin only)
 *     description: Retrieve aggregated statistics from all modules for the admin dashboard
 *     tags: [Summary]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully
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
 *                   example: Dashboard summary retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         active:
 *                           type: integer
 *                           example: 145
 *                         inactive:
 *                           type: integer
 *                           example: 5
 *                     blogs:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 50
 *                         published:
 *                           type: integer
 *                           example: 45
 *                         draft:
 *                           type: integer
 *                           example: 5
 *                         totalViews:
 *                           type: integer
 *                           example: 10000
 *                     testimonials:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 75
 *                         approved:
 *                           type: integer
 *                           example: 60
 *                         pending:
 *                           type: integer
 *                           example: 15
 *                     reels:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 30
 *                         published:
 *                           type: integer
 *                           example: 25
 *                         totalViews:
 *                           type: integer
 *                           example: 5000
 *                         totalLikes:
 *                           type: integer
 *                           example: 800
 *                     videos:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 20
 *                         published:
 *                           type: integer
 *                           example: 18
 *                         totalViews:
 *                           type: integer
 *                           example: 15000
 *                         totalLikes:
 *                           type: integer
 *                           example: 1200
 *                     leads:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 100
 *                         active:
 *                           type: integer
 *                           example: 95
 *                     materials:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 40
 *                         totalDownloads:
 *                           type: integer
 *                           example: 2500
 *                     bookings:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 60
 *                         confirmed:
 *                           type: integer
 *                           example: 50
 *                         pending:
 *                           type: integer
 *                           example: 10
 *                     counselors:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 15
 *                         active:
 *                           type: integer
 *                           example: 12
 *                     categories:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 8
 *                         active:
 *                           type: integer
 *                           example: 7
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-25T12:00:00.000Z
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */

export {};
