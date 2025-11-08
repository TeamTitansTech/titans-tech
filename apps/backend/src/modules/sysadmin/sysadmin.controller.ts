import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { SysAdminService } from './sysadmin.service';
import { LoginDto, LoginSchema } from './dto/login.dto';
import { Public } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class SysAdminController {
  constructor(private readonly sysAdminService: SysAdminService) {}

  @Public()
  @Post('login')
  async login(@Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto) {
    return this.sysAdminService.login(loginDto);
  }
}
