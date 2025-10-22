# Testimonials Module Documentation

## Overview
A complete testimonials management system with CRUD operations, approval workflow, social media integration, and location-based filtering.

## Features

### Core Functionality
- ✅ Create, Read, Update, Delete testimonials
- ✅ Admin approval workflow (testimonials require approval before being public)
- ✅ Favorite/Featured testimonials
- ✅ User social media links (Facebook, Instagram, Twitter/X, LinkedIn)
- ✅ Location tracking (City, State, Country)
- ✅ 5-star rating system
- ✅ Display order management for favorites
- ✅ Comprehensive search and filtering
- ✅ Pagination support
- ✅ Statistics and analytics

### Data Fields

#### Required Fields
- `name` - Full name (2-100 characters)
- `email` - Email address (validated)
- `city` - City (2-100 characters)
- `state` - State (2-100 characters)
- `rating` - Rating from 1-5 stars
- `message` - Testimonial content (10-2000 characters)

#### Optional Fields
- `country` - Country (default: "USA")
- `designation` - Job title/position
- `company` - Company name
- `profileImage` - Profile picture URL
- `socialMedia` - Social media links object:
  - `facebook` - Facebook profile URL
  - `instagram` - Instagram profile URL
  - `twitter` - Twitter/X profile URL
  - `linkedin` - LinkedIn profile URL

#### System Fields
- `userId` - Reference to the user who created it
- `isFavorite` - Featured testimonial flag (admin only)
- `isApproved` - Approval status (admin only)
- `isActive` - Soft delete flag
- `displayOrder` - Order for displaying favorites

#### Virtual Fields
- `fullLocation` - Computed as "City, State, Country"

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get All Testimonials
```
GET /api/v1/testimonials
Query Parameters:
  - page (default: 1)
  - limit (default: 10, max: 100)
  - sortBy (createdAt|rating|displayOrder|name)
  - sortOrder (asc|desc)
  - isApproved (boolean)
  - isFavorite (boolean)
  - rating (1-5)
  - city (string)
  - state (string)
  - search (string)
```

#### Get Approved Testimonials
```
GET /api/v1/testimonials/approved
Query Parameters: page, limit, sortBy, sortOrder
Returns: Only approved and active testimonials
```

#### Get Favorite/Featured Testimonials
```
GET /api/v1/testimonials/favorites
Query Parameters: page, limit, sortBy, sortOrder
Returns: Favorite testimonials sorted by displayOrder
```

#### Search Testimonials
```
GET /api/v1/testimonials/search?q=keyword
Query Parameters: q (required), page, limit, sortBy, sortOrder
```

#### Get by Location
```
GET /api/v1/testimonials/location?city=CityName&state=StateName
Query Parameters: city, state (at least one required), page, limit
```

#### Get by Rating
```
GET /api/v1/testimonials/rating/:rating
Path Parameters: rating (1-5)
Query Parameters: page, limit, sortBy, sortOrder
```

#### Get Testimonial by ID
```
GET /api/v1/testimonials/:id
Returns: Single testimonial with user details
```

### Public Testimonial Submission

#### Create Testimonial
```
POST /api/v1/testimonials
Authentication: NOT Required (Public - anyone can submit)
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "rating": 5,
  "message": "Great service!",
  "designation": "CEO",
  "company": "Tech Corp",
  "profileImage": "https://...",
  "socialMedia": {
    "facebook": "https://facebook.com/johndoe",
    "instagram": "https://instagram.com/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  }
}

Note:
- Public endpoint - no authentication needed
- Can be submitted by anyone (guest or registered user)
- If submitted by authenticated user, userId will be linked
- Testimonials are created with isApproved=false and require admin approval
```

### Authenticated User Endpoints

#### Get My Testimonials
```
GET /api/v1/testimonials/my/testimonials
Authentication: Required
Returns: All testimonials created by the authenticated user
```

#### Update Testimonial
```
PATCH /api/v1/testimonials/:id
Authentication: Required (Owner or Admin)
Body: Partial testimonial data (same as create)

Note: Regular users cannot change isApproved, isFavorite, or displayOrder
```

#### Delete Testimonial
```
DELETE /api/v1/testimonials/:id
Authentication: Required (Owner or Admin)
```

#### Deactivate Testimonial (Soft Delete)
```
POST /api/v1/testimonials/:id/deactivate
Authentication: Required (Owner or Admin)
```

### Admin Only Endpoints

#### Get Statistics
```
GET /api/v1/testimonials/stats/overview
Authentication: Required (Admin)
Returns: {
  "total": 100,
  "approved": 85,
  "pending": 15,
  "favorites": 10,
  "averageRating": "4.75",
  "ratingDistribution": [
    { "_id": 5, "count": 60 },
    { "_id": 4, "count": 25 },
    ...
  ]
}
```

#### Toggle Favorite Status
```
PATCH /api/v1/testimonials/:id/favorite
Authentication: Required (Admin)
```

#### Approve Testimonial
```
PATCH /api/v1/testimonials/:id/approve
Authentication: Required (Admin)
```

#### Reject Testimonial
```
PATCH /api/v1/testimonials/:id/reject
Authentication: Required (Admin)
```

## Database Schema

### Indexes
- `userId` - For user-based queries
- `rating` (descending) - For rating-based sorting
- `createdAt` (descending) - For chronological sorting
- `isFavorite`, `isApproved`, `isActive` (compound) - For filtering
- `city`, `state` (compound) - For location-based queries
- `name`, `message` (text index) - For full-text search

### Relationships
- **User (userId)** - Many-to-one relationship with User model
  - Auto-populated with: firstName, lastName, email, profilePicture

## Business Logic

### Creation Flow
1. User submits testimonial
2. System validates all fields
3. Checks for duplicate (same user + same message)
4. Creates testimonial with `isApproved: false`
5. Returns success message indicating approval is needed

### Approval Workflow
1. Admin reviews pending testimonials
2. Admin can approve or reject
3. Approved testimonials become visible in public endpoints
4. Rejected testimonials remain in database but not visible publicly

### Favorite/Featured System
1. Admin can mark testimonials as favorites
2. Featured testimonials can be assigned a display order
3. Public can retrieve favorites sorted by display order
4. Useful for homepage or landing page displays

### Validation Rules
- Email must be valid format
- Rating must be 1-5
- Message length: 10-2000 characters
- Name length: 2-100 characters
- City/State length: 2-100 characters
- Social media URLs validated by platform-specific regex patterns
- Duplicate prevention: Same user cannot submit identical message twice

## Usage Examples

### Frontend Integration

#### Display Approved Testimonials
```javascript
// Get all approved testimonials
fetch('/api/v1/testimonials/approved?limit=10&sortBy=rating&sortOrder=desc')
  .then(res => res.json())
  .then(data => {
    // data.data.testimonials - array of testimonials
    // data.data.total - total count
    // data.data.page - current page
    // data.data.totalPages - total pages
  });
```

#### Display Featured Testimonials (Homepage)
```javascript
// Get favorite testimonials for homepage
fetch('/api/v1/testimonials/favorites?limit=5')
  .then(res => res.json())
  .then(data => {
    // Display top 5 featured testimonials sorted by displayOrder
  });
```

#### Search Testimonials
```javascript
// Search for testimonials
fetch('/api/v1/testimonials/search?q=excellent&limit=20')
  .then(res => res.json())
  .then(data => {
    // Search results
  });
```

#### Filter by Location
```javascript
// Get testimonials from specific city
fetch('/api/v1/testimonials/location?city=New York&state=NY')
  .then(res => res.json())
  .then(data => {
    // Testimonials from New York, NY
  });
```

#### Filter by Rating
```javascript
// Get 5-star testimonials
fetch('/api/v1/testimonials/rating/5?limit=20')
  .then(res => res.json())
  .then(data => {
    // All 5-star testimonials
  });
```

#### Submit New Testimonial
```javascript
// User submits testimonial (requires authentication)
fetch('/api/v1/testimonials', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    name: 'Jane Smith',
    email: 'jane@example.com',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    rating: 5,
    message: 'Exceptional service! Highly recommend.',
    designation: 'Marketing Director',
    company: 'Digital Agency',
    socialMedia: {
      linkedin: 'https://linkedin.com/in/janesmith',
      twitter: 'https://twitter.com/janesmith'
    }
  })
})
.then(res => res.json())
.then(data => {
  console.log('Testimonial created, pending approval');
});
```

#### Admin: Approve Testimonial
```javascript
// Admin approves testimonial
fetch('/api/v1/testimonials/TESTIMONIAL_ID/approve', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer ADMIN_JWT_TOKEN'
  }
})
.then(res => res.json())
.then(data => {
  console.log('Testimonial approved');
});
```

#### Admin: Mark as Favorite
```javascript
// Admin marks testimonial as favorite
fetch('/api/v1/testimonials/TESTIMONIAL_ID/favorite', {
  method: 'PATCH',
  headers: {
    'Authorization': 'Bearer ADMIN_JWT_TOKEN'
  }
})
.then(res => res.json())
.then(data => {
  console.log('Favorite status toggled');
});
```

#### Admin: Get Statistics
```javascript
// Admin views statistics
fetch('/api/v1/testimonials/stats/overview', {
  headers: {
    'Authorization': 'Bearer ADMIN_JWT_TOKEN'
  }
})
.then(res => res.json())
.then(data => {
  console.log('Total:', data.data.total);
  console.log('Approved:', data.data.approved);
  console.log('Pending:', data.data.pending);
  console.log('Average Rating:', data.data.averageRating);
});
```

## Response Format

All endpoints return standardized responses:

### Success Response
```json
{
  "success": true,
  "message": "Testimonials retrieved successfully",
  "data": {
    "testimonials": [...],
    "total": 100,
    "page": 1,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## File Structure

```
src/
├── models/
│   └── testimonial.model.ts          # Mongoose schema and interfaces
├── repositories/
│   └── testimonial.repository.ts     # Data access layer
├── services/
│   └── testimonial.service.ts        # Business logic
├── controllers/
│   └── testimonial.controller.ts     # HTTP request handlers
├── routes/
│   └── testimonial.routes.ts         # Route definitions
├── validators/
│   └── testimonial.validator.ts      # Joi validation schemas
└── docs/
    └── swagger.docs.ts                # API documentation (testimonials section)
```

## Security Features

- ✅ JWT authentication for protected endpoints
- ✅ Role-based access control (User vs Admin)
- ✅ Input validation using Joi schemas
- ✅ Social media URL validation
- ✅ Email format validation
- ✅ Duplicate prevention
- ✅ Soft delete capability
- ✅ Ownership verification for updates/deletes

## Testing Recommendations

### Test Cases
1. **Create Testimonial**: Verify user can create with all required fields
2. **Duplicate Prevention**: Try creating same testimonial twice
3. **Approval Workflow**: Verify unapproved testimonials not in public endpoints
4. **Admin Approval**: Test admin can approve/reject
5. **Favorite System**: Test admin can toggle favorites and set display order
6. **Search**: Test full-text search functionality
7. **Location Filter**: Test city/state filtering
8. **Rating Filter**: Test filtering by rating
9. **Pagination**: Verify pagination works correctly
10. **Authorization**: Verify non-owners cannot update/delete others' testimonials
11. **Social Media Validation**: Test invalid URLs are rejected
12. **Statistics**: Verify admin stats are accurate

## Future Enhancements (Optional)

- [ ] Image upload for profile pictures (integrate with existing S3 service)
- [ ] Email notifications when testimonial is approved/rejected
- [ ] Testimonial moderation queue UI
- [ ] Verified purchase/service badge
- [ ] Reply to testimonials feature
- [ ] Export testimonials to CSV/PDF
- [ ] Testimonial widgets/embeds for external sites
- [ ] A/B testing for different testimonial displays
- [ ] Sentiment analysis on testimonial messages
- [ ] Automated spam detection

## Swagger Documentation

Full interactive API documentation available at: `/api-docs`

The testimonials module is fully documented with:
- Request/response schemas
- Parameter descriptions
- Authentication requirements
- Example requests/responses
- Error codes and messages

Access the Swagger UI by running the server and navigating to `http://localhost:5000/api-docs`
