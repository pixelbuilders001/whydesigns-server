// DynamoDB Table Names Configuration
// Prefix can be used for different environments (dev, staging, prod)
const TABLE_PREFIX = process.env.DYNAMODB_TABLE_PREFIX || 'why-designers';

export const TABLES = {
  USERS: `${TABLE_PREFIX}-users`,
  ROLES: `${TABLE_PREFIX}-roles`,
  LEADS: `${TABLE_PREFIX}-leads`,
  LEAD_ACTIVITIES: `${TABLE_PREFIX}-lead-activities`,
  BLOGS: `${TABLE_PREFIX}-blogs`,
  CATEGORIES: `${TABLE_PREFIX}-categories`,
  BOOKINGS: `${TABLE_PREFIX}-bookings`,
  COUNSELORS: `${TABLE_PREFIX}-counselors`,
  TESTIMONIALS: `${TABLE_PREFIX}-testimonials`,
  TEAM: `${TABLE_PREFIX}-team`,
  MATERIALS: `${TABLE_PREFIX}-materials`,
  REELS: `${TABLE_PREFIX}-reels`,
  VIDEOS: `${TABLE_PREFIX}-videos`,
  BANNERS: `${TABLE_PREFIX}-banners`,
  OTP: `${TABLE_PREFIX}-otp`,
} as const;

// GSI (Global Secondary Index) Names
export const GSI_NAMES = {
  // Users table GSIs
  USERS_EMAIL_INDEX: 'email-index',
  USERS_PHONE_INDEX: 'phone-index',
  USERS_ROLE_INDEX: 'roleId-index',
  USERS_PROVIDER_INDEX: 'provider-index',
  USERS_REFRESH_TOKEN_INDEX: 'refreshToken-index',

  // Roles table GSIs
  ROLES_NAME_INDEX: 'name-index',

  // Leads table GSIs
  LEADS_EMAIL_INDEX: 'email-index',
  LEADS_PHONE_INDEX: 'phone-index',
  LEADS_CONTACTED_INDEX: 'contacted-isActive-index',
  LEADS_CREATED_AT_INDEX: 'createdAt-index',

  // Blogs table GSIs
  BLOGS_SLUG_INDEX: 'slug-index',
  BLOGS_AUTHOR_STATUS_INDEX: 'authorId-status-index',
  BLOGS_STATUS_PUBLISHED_INDEX: 'status-publishedAt-index',
  BLOGS_TAGS_INDEX: 'tags-index',

  // Bookings table GSIs
  BOOKINGS_COUNSELOR_DATE_INDEX: 'counselorId-bookingDate-index',
  BOOKINGS_USER_STATUS_INDEX: 'userId-status-index',
  BOOKINGS_EMAIL_STATUS_INDEX: 'guestEmail-status-index',
  BOOKINGS_STATUS_DATE_INDEX: 'status-bookingDate-index',

  // Categories table GSIs
  CATEGORIES_SLUG_INDEX: 'slug-index',

  // Counselors table GSIs
  COUNSELORS_EMAIL_INDEX: 'email-index',
  COUNSELORS_SPECIALIZATION_INDEX: 'specialization-index',

  // Testimonials table GSIs
  TESTIMONIALS_STATUS_INDEX: 'status-createdAt-index',
  TESTIMONIALS_RATING_INDEX: 'rating-index',

  // OTP table GSIs
  OTP_EMAIL_INDEX: 'email-expiresAt-index',
} as const;

export default TABLES;
