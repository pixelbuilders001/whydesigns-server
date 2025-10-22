# Reels Module Documentation

## Overview
A complete short video (Reels) management system where admins can upload, manage, and publish short videos up to 3 minutes in length. Public users can view, like, and interact with published reels.

## Features

### Core Functionality
- ✅ **Admin-only upload** - Only admins can create and manage reels
- ✅ Create, Read, Update, Delete reels
- ✅ Publish/Unpublish workflow
- ✅ Video URL and thumbnail support
- ✅ Duration tracking (1-180 seconds / 3 minutes max)
- ✅ File size tracking with formatted display
- ✅ Category and tag organization
- ✅ View count tracking
- ✅ Like/Unlike functionality
- ✅ Display order management
- ✅ Full-text search
- ✅ Statistics and analytics
- ✅ Trending reels (most viewed, most liked, recent)

### Data Fields

#### Required Fields (Admin Upload)
- `title` - Reel title (2-200 characters)
- `videoUrl` - S3 URL or video URL
- `duration` - Video duration in seconds (1-180)
- `fileSize` - File size in bytes

#### Optional Fields
- `description` - Description (up to 1000 characters)
- `thumbnailUrl` - Thumbnail image URL
- `tags` - Array of tags (max 10)
- `category` - Category name (default: "General")
- `isPublished` - Publish status (default: false)
- `displayOrder` - Display order for sorting

#### System Fields
- `uploadedBy` - Reference to admin user who uploaded
- `viewCount` - Number of views (default: 0)
- `likeCount` - Number of likes (default: 0)
- `isActive` - Soft delete flag
- `publishedAt` - Timestamp when published

#### Virtual Fields
- `fileSizeFormatted` - Human-readable file size (e.g., "25.3 MB")
- `durationFormatted` - Formatted duration (e.g., "2:35")

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get Published Reels
```
GET /api/v1/reels
Query Parameters:
  - page (default: 1)
  - limit (default: 10, max: 100)
  - sortBy (createdAt|publishedAt|viewCount|likeCount|displayOrder|title)
  - sortOrder (asc|desc, default: desc)

Returns: Only published and active reels
```

#### Get Reel by ID
```
GET /api/v1/reels/:id
Returns: Single reel with uploader details
```

#### Search Reels
```
GET /api/v1/reels/search?q=keyword
Query Parameters:
  - q (required, min 2 chars)
  - page, limit, sortBy, sortOrder
```

#### Get Reels by Category
```
GET /api/v1/reels/category/:category
Path Parameters: category (string)
Query Parameters: page, limit, sortBy, sortOrder
```

#### Get Reels by Tags
```
GET /api/v1/reels/tags?tags=tag1,tag2,tag3
Query Parameters:
  - tags (required, comma-separated)
  - page, limit, sortBy, sortOrder
```

#### Get Most Viewed Reels
```
GET /api/v1/reels/trending/most-viewed?limit=10
Query Parameters: limit (default: 10, max: 100)
```

#### Get Most Liked Reels
```
GET /api/v1/reels/trending/most-liked?limit=10
Query Parameters: limit (default: 10, max: 100)
```

#### Get Recent Reels
```
GET /api/v1/reels/trending/recent?limit=10
Query Parameters: limit (default: 10, max: 100)
```

#### Get All Categories
```
GET /api/v1/reels/meta/categories
Returns: Array of unique category names
```

#### Get All Tags
```
GET /api/v1/reels/meta/tags
Returns: Array of unique tags
```

#### Increment View Count
```
POST /api/v1/reels/:id/view
Access: Public
Returns: Updated reel with incremented view count
```

#### Like Reel
```
POST /api/v1/reels/:id/like
Access: Public
Returns: Updated reel with incremented like count
```

#### Unlike Reel
```
POST /api/v1/reels/:id/unlike
Access: Public
Returns: Updated reel with decremented like count
```

### Admin Only Endpoints

#### Create Reel
```
POST /api/v1/reels
Authentication: Required (Admin)
Content-Type: multipart/form-data

Form Fields:
  - video (file, required): Video file (MP4, MOV, AVI, WMV, WebM, etc.)
  - thumbnail (file, optional): Thumbnail image (JPEG, PNG, GIF, WebP)
  - title (string, required): Reel title (2-200 chars)
  - description (string, optional): Description (up to 1000 chars)
  - duration (number, required): Duration in seconds (1-180)
  - tags (JSON string, optional): ["design", "tutorial", "tips"]
  - category (string, optional): Category name
  - isPublished (boolean, optional): Publish immediately (default: false)
  - displayOrder (number, optional): Display order

Note:
- Admin uploads video and thumbnail directly via multipart/form-data
- Files are automatically uploaded to S3
- Reels are created as unpublished by default
- Maximum video size: 100MB
- Maximum thumbnail size: 5MB
```

#### Get All Reels (Including Unpublished)
```
GET /api/v1/reels/all/reels
Authentication: Required (Admin)
Query Parameters: page, limit, sortBy, sortOrder, isPublished, category, tags, search

Returns: All reels including unpublished ones
```

#### Update Reel
```
PATCH /api/v1/reels/:id
Authentication: Required (Admin)
Content-Type: multipart/form-data

Form Fields (all optional):
  - video (file): New video file (replaces existing)
  - thumbnail (file): New thumbnail image (replaces existing)
  - title (string): Updated title
  - description (string): Updated description
  - duration (number): Updated duration
  - tags (JSON string): Updated tags array
  - category (string): Updated category
  - isPublished (boolean): Publish status
  - displayOrder (number): Display order

Note:
- All fields are optional
- If video is uploaded, old video is deleted from S3
- If thumbnail is uploaded, old thumbnail is deleted from S3
```

#### Publish Reel
```
PATCH /api/v1/reels/:id/publish
Authentication: Required (Admin)
Sets isPublished=true and publishedAt=now
```

#### Unpublish Reel
```
PATCH /api/v1/reels/:id/unpublish
Authentication: Required (Admin)
Sets isPublished=false
```

#### Deactivate Reel (Soft Delete)
```
POST /api/v1/reels/:id/deactivate
Authentication: Required (Admin)
```

#### Delete Reel (Hard Delete)
```
DELETE /api/v1/reels/:id
Authentication: Required (Admin)
```

#### Get Statistics
```
GET /api/v1/reels/stats/overview
Authentication: Required (Admin)
Returns: {
  "total": 150,
  "published": 120,
  "unpublished": 30,
  "totalViews": 45000,
  "totalLikes": 8500,
  "averageViews": "375.00",
  "categories": [
    { "_id": "Tutorial", "count": 50 },
    { "_id": "Showcase", "count": 40 },
    ...
  ]
}
```

## Database Schema

### Indexes
- `uploadedBy` - For uploader-based queries
- `createdAt` (descending) - Chronological sorting
- `publishedAt` (descending) - Published reels sorting
- `viewCount` (descending) - Most viewed
- `likeCount` (descending) - Most liked
- `isPublished`, `isActive` (compound) - Filtering
- `category` - Category-based queries
- `tags` - Tag-based queries
- `title`, `description`, `tags` (text index) - Full-text search
- `displayOrder` - Custom ordering

### Relationships
- **User (uploadedBy)** - Many-to-one relationship with User model
  - Auto-populated with: firstName, lastName, email, profilePicture

## Business Logic

### Upload Flow (Admin)
1. Admin uploads video to S3 (handled separately)
2. Admin creates reel with video URL and metadata
3. System validates duration (1-180 seconds)
4. Reel created with `isPublished: false`
5. Admin can preview before publishing

### Publish Workflow
1. Admin reviews unpublished reel
2. Admin publishes reel via `/reels/:id/publish`
3. System sets `isPublished: true` and `publishedAt: new Date()`
4. Reel becomes visible to public

### Public Interaction
1. User views published reels
2. Viewing a reel increments view count via `/reels/:id/view`
3. User can like/unlike reels (no authentication required)
4. Like/unlike updates like count

### Validation Rules
- Duration: 1-180 seconds (3 minutes max)
- Title: 2-200 characters
- Description: Up to 1000 characters
- Tags: Max 10 tags per reel
- Category: Max 50 characters
- Video URL: Must be valid URL
- Thumbnail URL: Must be valid URL (optional)

## Usage Examples

### Admin Upload Workflow

#### Using cURL
```bash
# Create reel with video and thumbnail upload
curl -X POST https://your-api.com/api/v1/reels \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "title=10 Design Tips for Beginners" \
  -F "description=Quick tips to improve your design skills" \
  -F "duration=95" \
  -F 'tags=["design", "tips", "beginners"]' \
  -F "category=Tutorial"

# Response:
{
  "success": true,
  "message": "Reel created successfully",
  "data": {
    "_id": "...",
    "title": "10 Design Tips for Beginners",
    "videoUrl": "https://bucket.s3.region.amazonaws.com/reels/videos/123-abc.mp4",
    "thumbnailUrl": "https://bucket.s3.region.amazonaws.com/reels/thumbnails/123-def.jpg",
    "isPublished": false,
    "uploadedBy": {...},
    "viewCount": 0,
    "likeCount": 0,
    "fileSize": 18500000,
    "fileSizeFormatted": "17.64 MB",
    "durationFormatted": "1:35",
    ...
  }
}

# Publish the reel
curl -X PATCH https://your-api.com/api/v1/reels/REEL_ID/publish \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Response:
{
  "success": true,
  "message": "Reel published successfully",
  "data": {
    "isPublished": true,
    "publishedAt": "2025-10-22T10:30:00.000Z",
    ...
  }
}
```

#### Using JavaScript/Fetch
```javascript
// Create reel with file upload
const formData = new FormData();
formData.append('video', videoFile); // File from input
formData.append('thumbnail', thumbnailFile); // File from input (optional)
formData.append('title', '10 Design Tips for Beginners');
formData.append('description', 'Quick tips to improve your design skills');
formData.append('duration', '95');
formData.append('tags', JSON.stringify(['design', 'tips', 'beginners']));
formData.append('category', 'Tutorial');

fetch('/api/v1/reels', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminToken
  },
  body: formData
})
.then(res => res.json())
.then(data => {
  console.log('Reel created:', data);
  // Now publish it
  return fetch(`/api/v1/reels/${data.data._id}/publish`, {
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer ' + adminToken
    }
  });
})
.then(res => res.json())
.then(data => {
  console.log('Reel published:', data);
});
```

#### Using Postman
```
1. Create a new POST request to: https://your-api.com/api/v1/reels
2. Set Authorization: Bearer Token (paste admin token)
3. Go to Body tab → select "form-data"
4. Add fields:
   - video (File) → Select video file
   - thumbnail (File) → Select image file
   - title (Text) → "10 Design Tips for Beginners"
   - description (Text) → "Quick tips..."
   - duration (Text) → "95"
   - tags (Text) → ["design", "tips", "beginners"]
   - category (Text) → "Tutorial"
5. Send request
```

### Public Usage

```javascript
// Get latest published reels
GET /api/v1/reels?limit=20&sortBy=publishedAt&sortOrder=desc

// Get reels in specific category
GET /api/v1/reels/category/Tutorial?limit=10

// Search reels
GET /api/v1/reels/search?q=design tips

// Get trending reels
GET /api/v1/reels/trending/most-viewed?limit=10
GET /api/v1/reels/trending/most-liked?limit=10
GET /api/v1/reels/trending/recent?limit=10

// View a reel (increment view count)
POST /api/v1/reels/REEL_ID/view

// Like a reel
POST /api/v1/reels/REEL_ID/like

// Unlike a reel
POST /api/v1/reels/REEL_ID/unlike
```

### Frontend Integration Examples

#### Display Reels Grid
```javascript
fetch('/api/v1/reels?limit=12')
  .then(res => res.json())
  .then(data => {
    const reels = data.data.reels;
    reels.forEach(reel => {
      console.log(reel.title);
      console.log(reel.thumbnailUrl);
      console.log(reel.durationFormatted); // "1:35"
      console.log(reel.fileSizeFormatted); // "18.5 MB"
      console.log(reel.viewCount);
      console.log(reel.likeCount);
    });
  });
```

#### Trending Section
```javascript
Promise.all([
  fetch('/api/v1/reels/trending/most-viewed?limit=5'),
  fetch('/api/v1/reels/trending/most-liked?limit=5'),
  fetch('/api/v1/reels/trending/recent?limit=5')
]).then(responses =>
  Promise.all(responses.map(r => r.json()))
).then(([mostViewed, mostLiked, recent]) => {
  // Display trending reels in different sections
});
```

#### Video Player with Interactions
```javascript
// When user starts watching
fetch(`/api/v1/reels/${reelId}/view`, {
  method: 'POST'
});

// Like button click
document.getElementById('likeBtn').addEventListener('click', () => {
  fetch(`/api/v1/reels/${reelId}/like`, {
    method: 'POST'
  })
  .then(res => res.json())
  .then(data => {
    // Update UI with new like count
    document.getElementById('likeCount').textContent = data.data.likeCount;
  });
});
```

#### Category Filter
```javascript
const categories = await fetch('/api/v1/reels/meta/categories')
  .then(res => res.json());

categories.data.forEach(category => {
  // Create category filter buttons
});

// When category selected
function loadCategory(category) {
  fetch(`/api/v1/reels/category/${category}?limit=20`)
    .then(res => res.json())
    .then(data => {
      // Display filtered reels
    });
}
```

## Response Format

All endpoints return standardized responses:

### Success Response
```json
{
  "success": true,
  "message": "Reels retrieved successfully",
  "data": {
    "reels": [...],
    "total": 150,
    "page": 1,
    "totalPages": 15
  }
}
```

### Single Reel Response
```json
{
  "success": true,
  "message": "Reel retrieved successfully",
  "data": {
    "_id": "...",
    "title": "Amazing Design Tutorial",
    "description": "Learn how to...",
    "videoUrl": "https://...",
    "thumbnailUrl": "https://...",
    "duration": 120,
    "fileSize": 25600000,
    "uploadedBy": {
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@example.com"
    },
    "tags": ["design", "tutorial"],
    "category": "Tutorial",
    "viewCount": 1250,
    "likeCount": 340,
    "isPublished": true,
    "isActive": true,
    "publishedAt": "2025-10-20T10:00:00.000Z",
    "createdAt": "2025-10-19T15:30:00.000Z",
    "updatedAt": "2025-10-22T08:45:00.000Z",
    "fileSizeFormatted": "24.41 MB",
    "durationFormatted": "2:00"
  }
}
```

## File Structure

```
src/
├── models/
│   └── reel.model.ts              # Mongoose schema and interfaces
├── repositories/
│   └── reel.repository.ts         # Data access layer (25+ methods)
├── services/
│   └── reel.service.ts            # Business logic
├── controllers/
│   └── reel.controller.ts         # HTTP request handlers (22 endpoints)
├── routes/
│   └── reel.routes.ts             # Route definitions
└── validators/
    └── reel.validator.ts          # Joi validation schemas
```

## Security Features

- ✅ Admin-only upload and management
- ✅ JWT authentication for protected endpoints
- ✅ Role-based access control
- ✅ Input validation using Joi schemas
- ✅ URL validation for video and thumbnail
- ✅ Duration validation (max 3 minutes)
- ✅ Tag limit enforcement
- ✅ Soft delete capability

## Video Upload Integration

The Reels module handles video and thumbnail uploads automatically using multipart/form-data.

### How It Works

1. **Admin uploads via form-data** - Video and thumbnail files are sent as multipart/form-data
2. **Multer processes files** - Files are stored in memory buffer
3. **Automatic S3 upload** - Controller uploads files to S3 automatically
4. **URLs saved to database** - S3 URLs are saved in the reel document
5. **Old files deleted** - When updating, old videos/thumbnails are deleted from S3

### File Upload Flow

```
Client → Multer Middleware → Controller → S3 Service → AWS S3
                                ↓
                          Save URLs to MongoDB
```

### Supported Video Formats

- MP4 (recommended)
- MOV
- AVI
- WMV
- WebM
- FLV
- 3GP
- MKV

### File Size Limits

- **Video**: 100MB maximum
- **Thumbnail**: 5MB maximum

### S3 Organization

```
your-bucket/
├── reels/
│   ├── videos/
│   │   ├── 1698765432-abc123.mp4
│   │   ├── 1698765433-def456.mp4
│   │   └── ...
│   └── thumbnails/
│       ├── 1698765432-ghi789.jpg
│       ├── 1698765433-jkl012.jpg
│       └── ...
```

### Admin Frontend Example (React)

```jsx
import { useState } from 'react';

function CreateReelForm() {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    category: '',
    tags: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('video', videoFile);
    if (thumbnailFile) {
      data.append('thumbnail', thumbnailFile);
    }
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('duration', formData.duration);
    data.append('category', formData.category);
    data.append('tags', JSON.stringify(formData.tags));

    const response = await fetch('/api/v1/reels', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      body: data
    });

    const result = await response.json();
    console.log('Reel created:', result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files[0])}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setThumbnailFile(e.target.files[0])}
      />
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        required
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
      />
      <input
        type="number"
        placeholder="Duration (seconds)"
        value={formData.duration}
        onChange={(e) => setFormData({...formData, duration: e.target.value})}
        required
      />
      <button type="submit">Upload Reel</button>
    </form>
  );
}
```

## Statistics Dashboard

Admins can view comprehensive statistics:

```javascript
GET /api/v1/reels/stats/overview

Response:
{
  "success": true,
  "data": {
    "total": 150,              // Total reels
    "published": 120,          // Published reels
    "unpublished": 30,         // Draft reels
    "totalViews": 45000,       // All-time views
    "totalLikes": 8500,        // All-time likes
    "averageViews": "375.00",  // Avg views per published reel
    "categories": [            // Reels per category
      { "_id": "Tutorial", "count": 50 },
      { "_id": "Showcase", "count": 40 },
      { "_id": "Tips", "count": 30 }
    ]
  }
}
```

## Best Practices

### For Admins
1. **Test before publishing** - Upload as unpublished, review, then publish
2. **Use descriptive titles** - Clear, engaging titles improve discoverability
3. **Add relevant tags** - Helps users find related content
4. **Optimize thumbnails** - Attractive thumbnails increase engagement
5. **Categorize properly** - Consistent categorization improves navigation
6. **Monitor analytics** - Use stats to understand what content works

### For Frontend Integration
1. **Lazy load reels** - Use pagination to avoid loading too many at once
2. **Preload thumbnails** - Cache thumbnails for smooth scrolling
3. **Track view count** - Call `/view` endpoint when video starts playing
4. **Debounce likes** - Prevent spam clicking on like/unlike
5. **Show loading states** - Video loading can take time
6. **Handle errors gracefully** - Show fallback UI if video fails to load

## Future Enhancements (Optional)

- [ ] Video processing (generate thumbnails automatically)
- [ ] Multiple quality options (360p, 720p, 1080p)
- [ ] Video transcoding for web optimization
- [ ] Comment system for reels
- [ ] Share functionality
- [ ] Playlist/collection feature
- [ ] Analytics per reel (watch time, completion rate)
- [ ] Trending algorithm based on engagement
- [ ] Related reels recommendations
- [ ] Download option (admin configurable)
- [ ] Watermark support
- [ ] Caption/subtitle support

## Notes

- Maximum video duration: **180 seconds (3 minutes)**
- Video URL must be accessible (S3, CDN, etc.)
- View count incremented on each play
- Like/unlike is public (no authentication required)
- Only admins can upload and manage reels
- Published reels are publicly accessible
- Unpublished reels are only visible to admins

The Reels module is **production-ready** and fully integrated with your existing authentication and S3 infrastructure!
