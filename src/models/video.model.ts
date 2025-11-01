import { BaseModel } from './base.model';

export interface IVideo extends BaseModel {
  id: string; // UUID - Primary Key
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  posterUrl?: string;
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

// Video creation input (without auto-generated fields)
export interface CreateVideoInput {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  posterUrl?: string;
  duration: number;
  fileSize: number;
  uploadedBy: string;
  tags?: string[];
  category?: string;
  isPublished?: boolean;
  displayOrder?: number;
}

// Video update input
export interface UpdateVideoInput {
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  posterUrl?: string;
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

// Video response interface
export interface VideoResponse extends IVideo {
  formattedDuration: string;
  formattedFileSize: string;
}

// Utility class for video operations
export class VideoUtils {
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

  // Publish video
  static publishVideo(video: IVideo): IVideo {
    return {
      ...video,
      isPublished: true,
      publishedAt: new Date().toISOString(),
    };
  }

  // Unpublish video
  static unpublishVideo(video: IVideo): IVideo {
    return {
      ...video,
      isPublished: false,
    };
  }

  // Increment view count
  static incrementViewCount(video: IVideo): IVideo {
    return {
      ...video,
      viewCount: video.viewCount + 1,
    };
  }

  // Increment like count
  static incrementLikeCount(video: IVideo): IVideo {
    return {
      ...video,
      likeCount: video.likeCount + 1,
    };
  }

  // Decrement like count
  static decrementLikeCount(video: IVideo): IVideo {
    return {
      ...video,
      likeCount: Math.max(0, video.likeCount - 1),
    };
  }

  // Convert to response with formatted fields
  static toResponse(video: IVideo): VideoResponse {
    return {
      ...video,
      formattedDuration: this.formatDuration(video.duration),
      formattedFileSize: this.formatFileSize(video.fileSize),
    };
  }
}

export default IVideo;
