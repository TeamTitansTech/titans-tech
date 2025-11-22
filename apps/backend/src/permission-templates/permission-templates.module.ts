import { Module } from '@nestjs/common';
import { PermissionTemplatesController } from './permission-templates.controller';
import { PermissionTemplatesService } from './permission-templates.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [PermissionTemplatesController],
  providers: [PermissionTemplatesService, PrismaService],
  exports: [PermissionTemplatesService],
})
export class PermissionTemplatesModule {}
