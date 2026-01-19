import { Module } from '@nestjs/common';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { SharedModule } from '../shared/shared.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [SharedModule, EmailModule],
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
