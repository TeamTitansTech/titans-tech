import { Module } from '@nestjs/common';
import { ProductionLinesService } from './production-lines.service';
import { ProductionLinesController } from './production-lines.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ProductionLinesController],
  providers: [ProductionLinesService, PrismaService],
  exports: [ProductionLinesService],
})
export class ProductionLinesModule {}
