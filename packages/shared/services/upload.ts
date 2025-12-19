import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';

export type UploadEnv = {
  AWS_S3_BUCKET_NAME: string;
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
};

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type UploadResult = {
  url: string;
};

export type UploadError = {
  type: 'BAD_REQUEST' | 'INTERNAL';
  message: string;
};

export type FileLike = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export function validateImageFile(file: FileLike): { error?: UploadError } {
  if (!file) {
    return { error: { type: 'BAD_REQUEST', message: 'No file provided' } };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      error: {
        type: 'BAD_REQUEST',
        message: 'Invalid file type. Only JPG, PNG, and WebP are allowed',
      },
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: { type: 'BAD_REQUEST', message: 'File size exceeds 10MB limit' } };
  }

  return {};
}

export async function uploadImageToS3(
  env: UploadEnv,
  file: FileLike,
  folder: string = 'blueprints',
): Promise<{ data?: UploadResult; error?: UploadError }> {
  const validation = validateImageFile(file);
  if (validation.error) {
    return { error: validation.error };
  }

  const s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const fileExtension = file.originalname.split('.').pop();
  const uniqueFilename = `${folder}/${nanoid()}-${Date.now()}.${fileExtension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: uniqueFilename,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    const publicUrl = `https://${env.AWS_S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${uniqueFilename}`;
    return { data: { url: publicUrl } };
  } catch (error: any) {
    return {
      error: { type: 'INTERNAL', message: `Failed to upload image to S3: ${error.message}` },
    };
  }
}
