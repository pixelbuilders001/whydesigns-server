import { BaseModel } from './base.model';

export interface IReel extends BaseModel {
  id: string; // UUID - Primary Key
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // in seconds
  fileSize: number; // in bytes
  uploadedBy: string; // User ID
  tags: string[];
  category?: string;
  viewCount: number;
  likeCount: number;
  isPublished: boolean;
  publishedAt: string | null; // ISO 8601 timestamp
  displayOrder: number;
}

// Reel creation input (without auto-generated fields)
export interface CreateReelInput {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  fileSize: number;
  uploadedBy: string;
  tags?: string[];
  category?: string;
  isPublished?: boolean;
  displayOrder?: number;
}

// Reel update input
export interface UpdateReelInput {
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
  tags?: string[];
  category?: string;
  viewCount?: number;
  likeCount?: number;
  isPublished?: boolean;
  publishedAt?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

// Reel response interface
export interface ReelResponse extends IReel {
  formattedDuration: string;
  formattedFileSize: string;
}

// Utility class for reel operations
export class ReelUtils {
  // Format duration (seconds to HH:MM:SS)
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(hours.toString().padStart(2, '0'));
    parts.push(minutes.toString().padStart(2, '0'));
    parts.push(secs.toString().padStart(2, '0'));

    return parts.join(':');
  }

  // Format file size (bytes to human readable)
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  // Publish reel
  static publishReel(reel: IReel): IReel {
    return {
      ...reel,
      isPublished: true,
      publishedAt: new Date().toISOString(),
    };
  }

  // Unpublish reel
  static unpublishReel(reel: IReel): IReel {
    return {
      ...reel,
      isPublished: false,
    };
  }

  // Increment view count
  static incrementViewCount(reel: IReel): IReel {
    return {
      ...reel,
      viewCount: reel.viewCount + 1,
    };
  }

  // Increment like count
  static incrementLikeCount(reel: IReel): IReel {
    return {
      ...reel,
      likeCount: reel.likeCount + 1,
    };
  }

  // Decrement like count
  static decrementLikeCount(reel: IReel): IReel {
    return {
      ...reel,
      likeCount: Math.max(0, reel.likeCount - 1),
    };
  }

  // Convert to response with formatted fields
  static toResponse(reel: IReel): ReelResponse {
    return {
      ...reel,
      formattedDuration: this.formatDuration(reel.duration),
      formattedFileSize: this.formatFileSize(reel.fileSize),
    };
  }
}

export default IReel;
