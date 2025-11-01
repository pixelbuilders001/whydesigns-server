import { BaseModel } from './base.model';

export interface IBanner extends BaseModel {
  _id: string; // UUID - Primary Key
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isPublished: boolean;
  publishedAt: string | null; // ISO 8601 timestamp
  displayOrder: number;
}

// Banner creation input (without auto-generated fields)
export interface CreateBannerInput {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  isPublished?: boolean;
  displayOrder?: number;
}

// Banner update input
export interface UpdateBannerInput {
  title?: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  isPublished?: boolean;
  publishedAt?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

// Banner response interface
export interface BannerResponse extends IBanner {}

// Utility class for banner operations
export class BannerUtils {
  // Publish banner
  static publishBanner(banner: IBanner): IBanner {
    return {
      ...banner,
      isPublished: true,
      publishedAt: new Date().toISOString(),
    };
  }

  // Unpublish banner
  static unpublishBanner(banner: IBanner): IBanner {
    return {
      ...banner,
      isPublished: false,
    };
  }

  // Update display order
  static updateDisplayOrder(banner: IBanner, order: number): IBanner {
    return {
      ...banner,
      displayOrder: order,
    };
  }

  // Validate link URL
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export default IBanner;
