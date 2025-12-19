import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendGridProvider } from './providers/sendgrid.provider';
import { PrismaService } from '../shared/prisma.service';

@Module({
  providers: [EmailService, SendGridProvider, PrismaService],
  exports: [EmailService],
})
export class EmailModule {}
