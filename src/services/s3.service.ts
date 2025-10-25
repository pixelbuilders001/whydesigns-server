import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { s3Client, S3_CONFIG } from '../config/s3.config';
import { InternalServerError } from '../utils/AppError';
import path from 'path';

export class S3Service {
  /**
   * Upload a file to S3
   * @param file - The file buffer from multer
   * @param folder - The folder path in S3 (e.g., 'profile-pictures', 'documents')
   * @returns The public URL of the uploaded file
   */
  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(file.originalname);
      const filename = `${folder}/${timestamp}-${randomString}${extension}`;

      // Upload to S3 using Upload for better handling of large files
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: S3_CONFIG.bucketName,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
          // Note: ACL is not included - configure bucket policy for public access if needed
        },
      });

      await upload.done();

      // Return the public URL
      const fileUrl = `https://${S3_CONFIG.bucketName}.s3.${S3_CONFIG.region}.amazonaws.com/${filename}`;
      return fileUrl;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerError('Failed to upload file to S3');
    }
  }

  /**
   * Delete a file from S3
   * @param fileUrl - The full URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract the key from the URL
      const urlParts = fileUrl.split('.amazonaws.com/');
      if (urlParts.length < 2) {
        console.warn('Invalid S3 URL format:', fileUrl);
        return;
      }

      const key = urlParts[1];

      const command = new DeleteObjectCommand({
        Bucket: S3_CONFIG.bucketName,
        Key: key,
      });

      await s3Client.send(command);
      console.log('File deleted from S3:', key);
    } catch (error) {
      console.error('S3 Delete Error:', error);
      // Don't throw error for delete failures, just log it
    }
  }

  /**
   * Upload profile picture
   * @param file - The file buffer from multer
   * @param userId - The user ID to associate with the picture
   * @returns The public URL of the uploaded profile picture
   */
  async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<string> {
    return await this.uploadFile(file, `profile-pictures/${userId}`);
  }

  /**
   * Delete old profile picture when updating
   * @param oldProfilePictureUrl - The URL of the old profile picture
   */
  async deleteOldProfilePicture(oldProfilePictureUrl: string): Promise<void> {
    if (oldProfilePictureUrl && oldProfilePictureUrl.includes('s3.amazonaws.com')) {
      await this.deleteFile(oldProfilePictureUrl);
    }
  }
}

export default new S3Service();
