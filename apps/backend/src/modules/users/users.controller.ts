import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdatePasswordDto } from '@titans-tech/shared';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { UpdatePasswordSchema } from '@titans-tech/shared';
import { BranchPermission, Public } from '../auth/auth.decorators';
import { ReqWithAuthUser } from '../../types/request';
import { LoginDto, LoginSchema } from '../sysadmin/dto/login.dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('login')
  async login(@Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto) {
    return this.usersService.login(loginDto.email, loginDto.password);
  }

  @BranchPermission('read')
  @Get('me')
  async getMe(@Request() req: ReqWithAuthUser) {
    return this.usersService.getMe(req.user.id);
  }

  @BranchPermission('read')
  @Post('update-password')
  async updateOwnPassword(
    @Body(new ZodValidationPipe(UpdatePasswordSchema))
    updatePasswordDto: UpdatePasswordDto,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.usersService.updatePassword(req.user.id, updatePasswordDto);
  }
}
