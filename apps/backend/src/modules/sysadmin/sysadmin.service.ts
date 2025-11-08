import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma.service';
import { LoginDto } from './dto/login.dto';
import { SysAdminResponseDto } from './dto/sysadmin-response.dto';
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
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, sysAdmin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
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
}
