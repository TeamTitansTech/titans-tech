import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { appEnv } from '../../config/env';
import { nanoid } from 'nanoid';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly ALLOWED_IMAGE_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  private readonly ALLOWED_DOCUMENT_MIME_TYPES = [
    'application/pdf',
    'text/csv',
  ];

  constructor() {
    this.bucketName = appEnv.AWS_S3_BUCKET_NAME;
    this.region = appEnv.AWS_REGION;

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: appEnv.AWS_ACCESS_KEY_ID,
        secretAccessKey: appEnv.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  private validateFileType(
    file: Express.Multer.File,
    allowedMimeTypes: string[],
    fileTypeLabel: string,
  ): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Only ${fileTypeLabel} are allowed. Received: ${file.mimetype}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      throw new BadRequestException(
        `File size exceeds maximum limit of 20MB. File size: ${fileSizeMB}MB`,
      );
    }
  }

  private generateUniqueFilename(originalName: string, folder: string): string {
    const fileExtension = originalName.split('.').pop();
    return `${folder}/${nanoid()}-${Date.now()}.${fileExtension}`;
  }

  private getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private async uploadToS3(
    file: Express.Multer.File,
    folder: string,
    fileType: 'image' | 'document',
  ): Promise<string> {
    const uniqueFilename = this.generateUniqueFilename(
      file.originalname,
      folder,
    );

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueFilename,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      return this.getPublicUrl(uniqueFilename);
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new BadRequestException(
        `Failed to upload ${fileType} to S3: ${error.message}`,
      );
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'blueprints',
  ): Promise<string> {
    this.validateFileType(
      file,
      this.ALLOWED_IMAGE_MIME_TYPES,
      'JPG, PNG, and WebP images',
    );

    return this.uploadToS3(file, folder, 'image');
  }

  validateFile(file: Express.Multer.File): boolean {
    this.validateFileType(
      file,
      this.ALLOWED_IMAGE_MIME_TYPES,
      'JPG, PNG, and WebP',
    );
    return true;
  }

  async uploadDocument(
    file: Express.Multer.File,
    folder: string = 'service-documents',
  ): Promise<{ url: string; originalName: string }> {
    this.validateFileType(
      file,
      this.ALLOWED_DOCUMENT_MIME_TYPES,
      'PDF and CSV files',
    );

    const url = await this.uploadToS3(file, folder, 'document');

    // Decode filename to UTF-8
    const decodedName = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );

    return {
      url,
      originalName: decodedName,
    };
  }

  validateDocumentFile(file: Express.Multer.File): boolean {
    this.validateFileType(
      file,
      this.ALLOWED_DOCUMENT_MIME_TYPES,
      'PDF and CSV files',
    );
    return true;
  }
}
