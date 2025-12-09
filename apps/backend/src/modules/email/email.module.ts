import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendGridProvider } from './providers/sendgrid.provider';
import { TemplateRendererService } from './services/template-renderer.service';
import { PrismaService } from '../shared/prisma.service';

@Module({
  providers: [
    EmailService,
    SendGridProvider,
    TemplateRendererService,
    PrismaService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
