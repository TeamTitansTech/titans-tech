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
import { Authenticated } from '../auth/auth.decorators';
import { ReqWithAuthUser } from '../../types/request';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Authenticated()
  @Get('me')
  async getMe(@Request() req: ReqWithAuthUser) {
    return this.usersService.getMe(req.user.id);
  }

  @Authenticated()
  @Post('update-password')
  async updateOwnPassword(
    @Body(new ZodValidationPipe(UpdatePasswordSchema))
    updatePasswordDto: UpdatePasswordDto,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.usersService.updatePassword(req.user.id, updatePasswordDto);
  }
}
