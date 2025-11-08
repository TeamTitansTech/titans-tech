import { Module } from '@nestjs/common';
import { BlueprintsService } from './blueprints.service';
import { BlueprintsController } from './blueprints.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [BlueprintsController],
  providers: [BlueprintsService, PrismaService],
  exports: [BlueprintsService],
})
export class BlueprintsModule {}
