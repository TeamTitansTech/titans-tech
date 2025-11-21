import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { PrismaService } from '../shared/prisma.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [ScheduleModule.forRoot(), EmailModule],
  providers: [TasksService, PrismaService],
  exports: [TasksService],
})
export class TasksModule {}
