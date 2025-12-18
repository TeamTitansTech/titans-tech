/**
 * Centralized upload configuration
 */

/**
 * Maximum file size for image uploads (20MB)
 */
export const MAX_FILE_SIZE = 20 * 1024 * 1024;

/**
 * Maximum file size in megabytes (for display purposes)
 */
export const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / 1024 / 1024;

/**
 * Allowed MIME types for image uploads
 */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const;

/**
 * Type for allowed image MIME types
 */
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

/**
 * Allowed MIME types for document uploads
 */
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/csv'] as const;

/**
 * Type for allowed document MIME types
 */
export type AllowedDocumentType = (typeof ALLOWED_DOCUMENT_TYPES)[number];

/**
 * Allowed file extensions for document uploads (for display)
 */
export const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.csv'] as const;
