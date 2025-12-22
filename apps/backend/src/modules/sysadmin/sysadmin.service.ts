import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma.service';
import {
  SysAdminResponseDto,
  UpdatePasswordDto,
  LoginDto,
} from '@titans-tech/shared/backend-dtos';
import { SysAdminJwtPayload } from '../../types/request';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';
import { PasswordResetService } from '../password-reset/password-reset.service';

@Injectable()
export class SysAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const normalizedEmail = email.toLowerCase().trim();

    const sysAdmin = await this.prisma.sysAdmin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!sysAdmin) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, sysAdmin.password);

    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    // Check if SysAdmin has pending activation
    const hasPendingActivation =
      await this.passwordResetService.checkSysAdminPendingActivation(
        sysAdmin.id,
      );

    if (hasPendingActivation) {
      throw new ForbiddenException(
        'Please activate your account using the email link sent to you',
      );
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

  async getMe(userId: string) {
    const sysAdmin = await this.prisma.sysAdmin.findUnique({
      where: { id: userId },
    });

    if (!sysAdmin) {
      throw new NotFoundException('SysAdmin not found');
    }

    // Buscar quantidade de notificações não lidas (Notification para sysadmin)
    const unreadNotifications = await this.prisma.notificationRecipient.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    const sysAdminResponse = new SysAdminResponseDto(sysAdmin);
    sysAdminResponse.unreadNotifications = unreadNotifications;

    return sysAdminResponse;
  }

  async updatePassword(userId: string, data: UpdatePasswordDto) {
    const sysAdmin = await this.prisma.sysAdmin.findUnique({
      where: { id: userId },
    });

    if (!sysAdmin) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      data.currentPassword,
      sysAdmin.password,
    );

    if (!isCurrentPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const updatedSysAdmin = await this.prisma.sysAdmin.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return new SysAdminResponseDto(updatedSysAdmin);
  }
}
