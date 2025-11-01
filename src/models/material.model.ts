import { BaseModel } from './base.model';

/**
 * Material Interface
 * Represents a downloadable material (PDF, documents, etc.)
 */
export interface IMaterial extends BaseModel {
  _id: string; // UUID - Primary Key
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string; // e.g., 'pdf', 'doc', 'zip', 'image'
  fileSize: number; // in bytes
  uploadedBy: string; // User ID
  category?: string;
  downloadCount: number;
  isPublished: boolean;
  publishedAt: string | null; // ISO 8601 timestamp
}

/**
 * Material creation input (without auto-generated fields)
 */
export interface CreateMaterialInput {
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  category?: string;
  isPublished?: boolean;
}

/**
 * Material update input
 */
export interface UpdateMaterialInput {
  title?: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  category?: string;
  downloadCount?: number;
  isPublished?: boolean;
  publishedAt?: string | null;
  isActive?: boolean;
}

/**
 * Material response interface
 */
export interface MaterialResponse extends IMaterial {
  formattedFileSize: string;
}

/**
 * Utility class for material operations
 */
export class MaterialUtils {
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

  // Publish material
  static publishMaterial(material: IMaterial): IMaterial {
    return {
      ...material,
      isPublished: true,
      publishedAt: new Date().toISOString(),
    };
  }

  // Unpublish material
  static unpublishMaterial(material: IMaterial): IMaterial {
    return {
      ...material,
      isPublished: false,
    };
  }

  // Increment download count
  static incrementDownloadCount(material: IMaterial): IMaterial {
    return {
      ...material,
      downloadCount: material.downloadCount + 1,
    };
  }

  // Get file extension from file type
  static getFileExtension(fileType: string): string {
    const extensions: { [key: string]: string } = {
      'pdf': 'pdf',
      'document': 'doc',
      'zip': 'zip',
      'image': 'img',
      'video': 'mp4',
      'audio': 'mp3',
      'text': 'txt',
    };

    return extensions[fileType.toLowerCase()] || fileType;
  }

  // Convert to response with formatted fields
  static toResponse(material: IMaterial): MaterialResponse {
    return {
      ...material,
      formattedFileSize: this.formatFileSize(material.fileSize),
    };
  }
}

export default IMaterial;
