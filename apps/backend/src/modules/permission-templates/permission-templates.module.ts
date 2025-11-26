import { Module } from '@nestjs/common';
import { PermissionTemplatesController } from './permission-templates.controller';
import { PermissionTemplatesService } from './permission-templates.service';

@Module({
  controllers: [PermissionTemplatesController],
  providers: [PermissionTemplatesService],
  exports: [PermissionTemplatesService],
})
export class PermissionTemplatesModule {}
