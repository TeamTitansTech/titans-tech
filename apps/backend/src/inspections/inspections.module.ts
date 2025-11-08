import { Module } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { InspectionsController } from './inspections.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [InspectionsController],
  providers: [InspectionsService, PrismaService],
  exports: [InspectionsService],
})
export class InspectionsModule {}
