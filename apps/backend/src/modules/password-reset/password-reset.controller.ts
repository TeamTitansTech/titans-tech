import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import {
  ForgotPasswordDto,
  ForgotPasswordSchema,
  ResetPasswordDto,
  ResetPasswordSchema,
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
    await this.passwordResetService.requestPasswordReset(
      dto.email,
      dto.companyId || null,
    );
    return { message: 'If email exists, reset link has been sent' };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordSchema))
    dto: ResetPasswordDto,
  ) {
    await this.passwordResetService.resetPasswordWithJwt(
      dto.token,
      dto.password,
    );
    return { message: 'Password reset successfully' };
  }

  @Public()
  @Get('validate/:token')
  async validateToken(@Param('token') token: string) {
    const result =
      await this.passwordResetService.validateActivationToken(token);
    return result;
  }

  @Public()
  @Post('set-password')
  async setPassword(
    @Body(new ZodValidationPipe(SetPasswordSchema))
    dto: SetPasswordDto,
  ) {
    await this.passwordResetService.setPasswordWithActivationToken(
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
