import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
  Get,
} from '@nestjs/common';
import { SysAdminService } from './sysadmin.service';
import { Authenticated, Public } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import {
  UpdatePasswordDto,
  UpdatePasswordSchema,
  LoginDto,
  LoginSchema,
} from '@titans-tech/shared';
import { ReqWithAuthUser } from 'src/types/request';

@Controller('auth/admin')
@UseInterceptors(ClassSerializerInterceptor)
export class SysAdminController {
  constructor(private readonly sysAdminService: SysAdminService) {}

  @Public()
  @Post('login')
  async login(@Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto) {
    return this.sysAdminService.login(loginDto);
  }

  @Authenticated()
  @Get('me')
  async getMe(@Request() req: ReqWithAuthUser) {
    return this.sysAdminService.getMe(req.user.id);
  }

  @Authenticated()
  @Post('update-password')
  async updatePassword(
    @Body(new ZodValidationPipe(UpdatePasswordSchema))
    updatePasswordDto: UpdatePasswordDto,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.sysAdminService.updatePassword(req.user.id, updatePasswordDto);
  }
}
