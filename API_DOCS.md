# Why Designers - API Documentation

Base URL: `http://localhost:5000/api/v1`

## 📚 Interactive API Documentation

**🚀 NEW: Swagger/OpenAPI Documentation Available!**

Visit our interactive API documentation at: **http://localhost:5000/api-docs**

**Features:**
- ✅ Interactive UI to test all API endpoints
- ✅ Built-in authentication support (click "Authorize" button)
- ✅ Request/response examples
- ✅ Schema validation
- ✅ No additional tools needed (runs in browser)

**How to Use:**
1. Start the server: `npm run dev`
2. Open browser: `http://localhost:5000/api-docs`
3. Click "Authorize" button (top right) to add your JWT token
4. Test any endpoint directly from the browser

**Export Options:**
- JSON format: `http://localhost:5000/api-docs.json`

---

## Table of Contents
- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
- [User Endpoints](#user-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Error Responses](#error-responses)

---

## Authentication

Most endpoints require authentication using Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Verification Requirements

**Important:** After registration, users must verify their **email OR phone** to access most protected endpoints.

**Routes that DON'T require verification:**
- ✅ `/logout` - You can logout without verification
- ✅ `/profile` (GET) - You can view your profile to see verification status
- ✅ `/verify-email` - Needed to verify your email
- ✅ `/resend-otp` - Needed to get new OTP
- ✅ `/verify-phone` - Needed to verify your phone

**Routes that REQUIRE verification (email OR phone):**
- 🔒 `/profile` (PATCH) - Update profile
- 🔒 `/profile/upload` (PUT) - Update profile with image
- 🔒 `/change-password` - Change password
- 🔒 All admin routes - Admin operations

**Error Response (403 Forbidden) if not verified:**
```json
{
  "success": false,
  "message": "Please verify your email or phone number to access this resource"
}
```

---

## Email Verification Flow

The API uses a 6-digit OTP system for email verification:

### How It Works

1. **Registration**: When a user registers, a 6-digit OTP is automatically sent to their email
2. **OTP Validity**: The OTP is valid for 5 minutes
3. **Verification**: User must call the `/verify-email` endpoint with the OTP
4. **Resend**: If OTP expires or is not received, use `/resend-otp` endpoint (rate limited to once per minute)
5. **Welcome Email**: Upon successful verification, a welcome email is sent

### Example Flow

```
1. POST /users/register
   → User created, OTP sent to email (123456)

2. Check email for 6-digit OTP

3. POST /users/verify-email with {"otp": "123456"}
   → Email verified, welcome email sent

// If OTP expired:
4. POST /users/resend-otp
   → New OTP sent (654321)

5. POST /users/verify-email with {"otp": "654321"}
   → Email verified
```

### AWS SES Configuration Required

To enable email sending, configure AWS SES:

1. **Verify Your Email in AWS SES Console**
   - Go to AWS SES → Verified Identities
   - Verify the email address you'll use as sender (AWS_SES_FROM_EMAIL)
   - For production, move SES out of sandbox mode

2. **Environment Variables**
   ```env
   AWS_ACCESS_KEY_ID=your-aws-access-key-id
   AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
   AWS_SES_REGION=us-east-1
   AWS_SES_FROM_EMAIL=noreply@why-designers.com
   AWS_SES_FROM_NAME=Why Designers
   ```

3. **Sandbox Mode Limitations**
   - In sandbox mode, you can only send emails to verified email addresses
   - Request production access to send to any email address

---

## Public Endpoints

### 1. Register User

Create a new user account. User will automatically be assigned the USER role. **An OTP will be sent to the registered email for verification.**

**Endpoint:** `POST /users/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "address": "123 Main Street, New York",
  "profilePicture": "https://example.com/profile.jpg"
}
```

**Required Fields:**
- `firstName` (min: 2, max: 50 characters)
- `lastName` (min: 2, max: 50 characters)
- `email` (valid email format)
- `password` (min: 6 characters)
- `phoneNumber` (valid phone format)
- `dateOfBirth` (date in the past)
- `gender` (male, female, or other)

**Optional Fields:**
- `address`
- `profilePicture` (valid URL)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64abc123def456789",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "gender": "male",
      "address": "123 Main Street, New York",
      "profilePicture": "https://example.com/profile.jpg",
      "roleId": {
        "_id": "64xyz...",
        "name": "USER",
        "description": "Regular user with basic permissions"
      },
      "isEmailVerified": false,
      "isPhoneVerified": false,
      "isActive": true,
      "provider": "local",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "1990-01-15",
    "gender": "male",
    "address": "123 Main Street, New York",
    "profilePicture": "https://example.com/profile.jpg"
  }'
```

---

### 2. Login User

Authenticate user and receive access tokens.

**Endpoint:** `POST /users/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64abc123def456789",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "roleId": { ... },
      "isActive": true,
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

---

### 3. Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /users/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/users/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

### 4. Health Check

Check if the API server is running.

**Endpoint:** `GET /health`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/v1/health
```

---

## User Endpoints

All user endpoints require authentication (Bearer token).

### 5. Get User Profile

Get the authenticated user's profile.

**Endpoint:** `GET /users/profile`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "64abc123def456789",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "gender": "male",
    "address": "123 Main Street, New York",
    "profilePicture": "https://example.com/profile.jpg",
    "roleId": {
      "_id": "64xyz...",
      "name": "USER"
    },
    "isEmailVerified": false,
    "isPhoneVerified": false,
    "isActive": true,
    "provider": "local",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Update User Profile

Update the authenticated user's profile information.

**⚠️ Requires Verification:** You must verify your email OR phone to use this endpoint.

**Endpoint:** `PATCH /users/profile`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+9876543210",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "address": "456 New Street, Los Angeles",
  "profilePicture": "https://example.com/new-profile.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "64abc123def456789",
    "firstName": "John",
    "lastName": "Smith",
    ...
  }
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "+9876543210"
  }'
```

---

### 7. Update Profile with Image Upload

Update user profile with profile picture upload to AWS S3. This endpoint accepts multipart/form-data and handles image upload.

**⚠️ Requires Verification:** You must verify your email OR phone to use this endpoint.

**Endpoint:** `PUT /users/profile/upload`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data Fields (all optional except profilePicture):**
- `firstName` (string) - User's first name
- `lastName` (string) - User's last name
- `phoneNumber` (string) - Phone number with country code
- `dateOfBirth` (string) - Date in YYYY-MM-DD format
- `gender` (string) - male, female, or other
- `address` (string) - User's address
- `profilePicture` (file) - Image file (JPEG, PNG, GIF, WebP - max 5MB)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "64abc123def456789",
    "firstName": "John",
    "lastName": "Smith",
    "profilePicture": "https://your-bucket.s3.us-east-1.amazonaws.com/profile-pictures/64abc123def456789/1234567890-abc123.jpg",
    ...
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:5000/api/v1/users/profile/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "profilePicture=@/path/to/image.jpg" \
  -F "firstName=John" \
  -F "lastName=Smith" \
  -F "phoneNumber=+9876543210"
```

**JavaScript/Fetch Example:**
```javascript
const formData = new FormData();
formData.append('profilePicture', fileInput.files[0]);
formData.append('firstName', 'John');
formData.append('lastName', 'Smith');

fetch('http://localhost:5000/api/v1/users/profile/upload', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Notes:**
- Old profile picture is automatically deleted from S3 when uploading a new one
- Supported image formats: JPEG, JPG, PNG, GIF, WebP
- Maximum file size: 5MB
- File naming: `profile-pictures/{userId}/{timestamp}-{random}.{ext}`

**AWS S3 Setup Required:**

1. **Environment Variables** - Configure these in your `.env` file:
```env
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

2. **S3 Bucket Configuration** - Make your bucket publicly accessible:

   **Option A: Using AWS Console**
   - Go to S3 → Your Bucket → Permissions
   - Disable "Block all public access"
   - Add this Bucket Policy (replace `your-bucket-name` with actual bucket name):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```

   **Option B: Keep Files Private**
   - If you prefer private files, you'll need to implement signed URLs (not included in current implementation)
   - Files will be uploaded but not publicly accessible without authentication

---

### 8. Change Password

Change the authenticated user's password.

**⚠️ Requires Verification:** You must verify your email OR phone to use this endpoint.

**Endpoint:** `POST /users/change-password`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/users/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword123",
    "confirmPassword": "newpassword123"
  }'
```

---

### 8. Verify Email with OTP

Verify user's email using the 6-digit OTP sent during registration. OTP expires after 5 minutes.

**Endpoint:** `POST /users/verify-email`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "_id": "64abc123def456789",
    "isEmailVerified": true,
    ...
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/users/verify-email \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"otp": "123456"}'
```

**Notes:**
- OTP is valid for 5 minutes after it's sent
- OTP can only be used once
- A welcome email will be sent upon successful verification
- Check your email (including spam folder) for the OTP

---

### 9. Resend OTP

Resend email verification OTP if the previous one expired or was not received. Rate limited to once per minute.

**Endpoint:** `POST /users/resend-otp`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP has been sent to your email",
  "data": null
}
```

**Error Responses:**

**400 Bad Request (Already Verified):**
```json
{
  "success": false,
  "message": "Email is already verified"
}
```

**400 Bad Request (Rate Limit):**
```json
{
  "success": false,
  "message": "Please wait at least 60 seconds before requesting a new OTP"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/users/resend-otp \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Notes:**
- Can only request a new OTP once per minute
- Cannot resend if email is already verified
- New OTP invalidates any previous unused OTPs
- OTP is valid for 5 minutes

---

### 10. Verify Phone

Mark user's phone as verified.

**Endpoint:** `POST /users/verify-phone`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Phone verified successfully",
  "data": {
    "_id": "64abc123def456789",
    "isPhoneVerified": true,
    ...
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/users/verify-phone \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 11. Logout

Logout user and invalidate refresh token.

**Endpoint:** `POST /users/logout`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/users/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Admin Endpoints

All admin endpoints require:
- ✅ Authentication with ADMIN role
- ✅ Email OR phone verification

### 12. Get All Users

Get a paginated list of all users (Admin only).

**Endpoint:** `GET /users`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 10, max: 100) - Items per page
- `sortBy` (default: "createdAt") - Sort field
- `order` (default: "desc") - Sort order (asc/desc)
- `search` (optional) - Search in name, email, phone
- `role` (optional) - Filter by role
- `isActive` (optional) - Filter by active status
- `provider` (optional) - Filter by provider (google, facebook, local)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "64abc123def456789",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      ...
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

**cURL Examples:**
```bash
# Get first page
curl "http://localhost:5000/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Search users
curl "http://localhost:5000/api/v1/users?search=john" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Filter by role
curl "http://localhost:5000/api/v1/users?role=ADMIN" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Filter by active status
curl "http://localhost:5000/api/v1/users?isActive=true" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

### 13. Get User By ID

Get a specific user by ID (Admin only).

**Endpoint:** `GET /users/:id`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "_id": "64abc123def456789",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    ...
  }
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/v1/users/64abc123def456789 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

### 14. Update User

Update any user's information (Admin only).

**Endpoint:** `PATCH /users/:id`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "+9876543210",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "address": "456 New Street",
  "profilePicture": "https://example.com/profile.jpg",
  "isActive": true,
  "roleId": "64xyz..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "_id": "64abc123def456789",
    ...
  }
}
```

**cURL Example:**
```bash
curl -X PATCH http://localhost:5000/api/v1/users/64abc123def456789 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith"
  }'
```

---

### 15. Delete User

Permanently delete a user (Admin only).

**Endpoint:** `DELETE /users/:id`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/v1/users/64abc123def456789 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

### 16. Deactivate User (Soft Delete)

Deactivate a user account without deleting (Admin only).

**Endpoint:** `POST /users/:id/deactivate`

**Headers:**
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "_id": "64abc123def456789",
    "isActive": false,
    ...
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/v1/users/64abc123def456789/deactivate \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## Error Responses

All error responses follow this format:

**Format:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

### Common Error Status Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate entry (email/phone) |
| 422 | Validation Error - Input validation failed |
| 500 | Internal Server Error - Server error |

### Error Examples

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation Error",
  "data": {
    "errors": [
      "First name must be at least 2 characters",
      "Please provide a valid email"
    ]
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

## Testing the API

### Using Postman

1. Import the endpoints into Postman
2. Create an environment variable `baseUrl` = `http://localhost:5000/api/v1`
3. Create an environment variable `token` for storing JWT token
4. Set Authorization header: `Bearer {{token}}`

### Using cURL

Save your token in an environment variable:
```bash
export TOKEN="your_jwt_token_here"
```

Then use it in requests:
```bash
curl http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD)
- All timestamps in responses are in ISO 8601 format with timezone
- Phone numbers should include country code (e.g., +1234567890)
- Passwords must be at least 6 characters
- JWT tokens expire after 7 days (configurable)
- Refresh tokens expire after 30 days
- All endpoints return JSON responses
- CORS is enabled for all origins in development

---

## Role System

The system has two roles:

1. **USER** (Default)
   - Can view and update own profile
   - Can change own password
   - Can verify own email/phone

2. **ADMIN**
   - All USER permissions
   - Can view all users
   - Can update any user
   - Can delete any user
   - Can deactivate any user

---

For more information, see the main [README.md](README.md) file.
