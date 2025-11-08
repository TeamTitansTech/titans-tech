import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SysAdminResponseDto, UpdatePasswordDto } from '@titans-tech/shared';
import { SysAdminJwtPayload } from '../../types/request';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SysAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const sysAdmin = await this.prisma.sysAdmin.findUnique({
      where: { email },
    });

    if (!sysAdmin) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, sysAdmin.password);

    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    const payload: SysAdminJwtPayload = {
      id: sysAdmin.id,
      isSysAdmin: true,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: new SysAdminResponseDto(sysAdmin),
    };
  }

  async updatePassword(userId: string, data: UpdatePasswordDto) {
    const sysAdmin = await this.prisma.sysAdmin.findUnique({
      where: { id: userId },
    });

    if (!sysAdmin) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isCurrentPasswordValid = sysAdmin.isUsingDefaultPassword
      ? true
      : await bcrypt.compare(data.currentPassword, sysAdmin.password);

    if (!isCurrentPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const updatedSysAdmin = await this.prisma.sysAdmin.update({
      where: { id: userId },
      data: { password: hashedPassword, isUsingDefaultPassword: false },
    });

    return new SysAdminResponseDto(updatedSysAdmin);
  }
}
