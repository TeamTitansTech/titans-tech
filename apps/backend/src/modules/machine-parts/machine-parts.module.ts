import { Module } from '@nestjs/common';
import { MachinePartsService } from './machine-parts.service';
import { MachinePartsController } from './machine-parts.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [MachinePartsController],
  providers: [MachinePartsService],
  exports: [MachinePartsService],
})
export class MachinePartsModule {}
