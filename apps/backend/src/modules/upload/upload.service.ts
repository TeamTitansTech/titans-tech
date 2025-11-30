import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { appEnv } from '../../config/env';
import { nanoid } from 'nanoid';

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;
  private readonly ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024;

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

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'blueprints',
  ): Promise<string> {
    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Only JPG, PNG, and WebP images are allowed. Received: ${file.mimetype}`,
      );
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum limit of 10MB. File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    const fileExtension = file.originalname.split('.').pop();
    const uniqueFilename = `${folder}/${nanoid()}-${Date.now()}.${fileExtension}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uniqueFilename,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${uniqueFilename}`;

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file to S3:', error);
      throw new BadRequestException(
        `Failed to upload image to S3: ${error.message}`,
      );
    }
  }

  validateFile(file: Express.Multer.File): boolean {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPG, PNG, and WebP are allowed',
      );
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    return true;
  }
}
