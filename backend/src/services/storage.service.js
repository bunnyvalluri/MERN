import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import { ApiError } from '../utils/ApiError.js';

// Configure Cloudinary if environment variables are provided
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export class StorageService {
  /**
   * Uploads an in-memory buffer directly to cloud object storage (Cloudinary).
   * In local development or test environments without cloud keys,
   * falls back safely to a deterministic mock cloud CDN provider simulator.
   *
   * @param {Buffer} buffer - File buffer from Multer memory storage
   * @param {Object} options - { folder, publicId, resourceType, allowedFormats }
   * @returns {Promise<{ url: string, publicId: string, bytes: number, format: string }>}
   */
  static uploadBuffer(buffer, options = {}) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new ApiError(400, 'Invalid file buffer provided for upload.');
    }

    const folder = options.folder || 'internhub/documents';
    const resourceType = options.resourceType || 'auto';
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const customPublicId = options.publicId
      ? `${options.publicId}-${uniqueSuffix}`
      : `asset-${Date.now()}-${uniqueSuffix}`;

    // 1. Cloudinary production upload if credentials configured
    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (isCloudinaryConfigured && process.env.NODE_ENV !== 'test') {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: customPublicId,
            resource_type: resourceType,
            overwrite: true,
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload stream error:', error);
              return reject(
                new ApiError(500, 'Cloud storage upload failed. Please try again.')
              );
            }
            resolve({
              url: result.secure_url || result.url,
              publicId: result.public_id,
              bytes: result.bytes || buffer.length,
              format: result.format || 'bin',
            });
          }
        );

        uploadStream.end(buffer);
      });
    }

    // 2. High-performance Mock Cloud CDN Simulator (for local dev & test suites)
    // Generates simulated CDN URLs without writing permanent files to Node local disk
    const mockPublicId = `${folder}/${customPublicId}`;
    const mockHash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 16);
    const mockExt = options.format || 'pdf';
    const mockUrl = `https://storage.internhub.io/${folder}/${mockHash}.${mockExt}`;

    return {
      url: mockUrl,
      publicId: mockPublicId,
      bytes: buffer.length,
      format: mockExt,
    };
  }

  /**
   * Deletes a resource from cloud object storage by publicId.
   */
  static async deleteFile(publicId, resourceType = 'auto') {
    if (!publicId) return true;

    const isCloudinaryConfigured =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (isCloudinaryConfigured && process.env.NODE_ENV !== 'test') {
      try {
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
        });
        return result.result === 'ok';
      } catch (err) {
        logger.warn(`Cloudinary destroy failed for publicId "${publicId}":`, err.message);
        return false;
      }
    }

    // Mock storage deletion
    return true;
  }
}

export default StorageService;
