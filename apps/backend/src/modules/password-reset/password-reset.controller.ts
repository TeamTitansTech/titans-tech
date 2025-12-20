import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import {
  ForgotPasswordDto,
  ForgotPasswordSchema,
  SetPasswordDto,
  SetPasswordSchema,
} from '@titans-tech/shared/backend-dtos';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { Public } from '../auth/auth.decorators';

@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordSchema))
    dto: ForgotPasswordDto,
  ) {
    await this.passwordResetService.requestPasswordReset(dto.email, false);
    return { message: 'If email exists, reset link has been sent' };
  }

  @Public()
  @Post('admin/forgot-password')
  async adminForgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordSchema))
    dto: ForgotPasswordDto,
  ) {
    await this.passwordResetService.requestPasswordReset(dto.email, true);
    return { message: 'If email exists, reset link has been sent' };
  }

  @Public()
  @Get('validate/:token')
  async validateToken(@Param('token') token: string) {
    return this.passwordResetService.validateToken(token);
  }

  @Public()
  @Post('set-password')
  async setPassword(
    @Body(new ZodValidationPipe(SetPasswordSchema)) dto: SetPasswordDto,
  ) {
    await this.passwordResetService.setPasswordWithToken(
      dto.token,
      dto.password,
    );
    return { message: 'Password set successfully' };
  }

  @Post('resend-activation/:userId')
  async resendActivation(@Param('userId') userId: string) {
    await this.passwordResetService.resendActivationEmail(userId);
    return { message: 'Activation email sent successfully' };
  }
}
