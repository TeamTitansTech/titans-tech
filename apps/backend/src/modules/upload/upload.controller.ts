import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Public } from 'src/modules/auth/auth.decorators';
import { MAX_FILE_SIZE } from '../../../../../apps/dashboard/src/config/uploads';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public()
  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    this.uploadService.validateFile(file);
    const url = await this.uploadService.uploadImage(file);

    return { url };
  }

  @Public()
  @Post('logo')
  @UseInterceptors(
    FileInterceptor('logo', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  async uploadLogo(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('No logo file provided');
    }

    this.uploadService.validateFile(file);
    const url = await this.uploadService.uploadImage(file, 'logos');

    return { url };
  }

  @Post('document')
  @UseInterceptors(
    FileInterceptor('document', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; originalName: string }> {
    if (!file) {
      throw new BadRequestException('No document file provided');
    }

    this.uploadService.validateDocumentFile(file);
    return await this.uploadService.uploadDocument(file);
  }
}
