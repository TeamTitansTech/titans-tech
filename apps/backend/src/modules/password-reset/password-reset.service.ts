import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/prisma.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import type { Locale } from '../email/templates/i18n';
import { appEnv } from '../../config/env';
import {
  PasswordResetUserPayload,
  PasswordResetSysAdminPayload,
  PasswordResetPayload,
} from '../../types/request';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async createActivationToken(
    userId: string,
    userEmail: string,
    userName: string | null,
    companySlug: string,
    companyName: string,
    locale: Locale = 'en',
  ): Promise<void> {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.passwordResetToken.create({
      data: {
        token,
        type: 'ACTIVATION',
        userId,
        expiresAt,
      },
    });

    const urlParts = appEnv.FRONTEND_URL.split('://');
    const protocol = urlParts[0];
    const domain = urlParts[1].replace(/\/$/, '');
    const activationUrl = `${protocol}://${companySlug}.${domain}/set-password/${token}`;

    await this.emailService.sendPasswordActivationEmail(
      userEmail,
      {
        userName: userName || 'User',
        companyName,
        activationUrl,
      },
      locale,
    );
  }

  async createSysAdminActivationToken(
    sysAdminId: string,
    sysAdminEmail: string,
    locale: Locale = 'en',
  ): Promise<void> {
    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.passwordResetToken.create({
      data: {
        token,
        type: 'ACTIVATION',
        sysAdminId,
        expiresAt,
      },
    });

    await this.emailService.sendPasswordActivationEmail(
      sysAdminEmail,
      {
        userName: 'Admin',
        companyName: 'Titans Tech Admin Portal',
        activationUrl: `${appEnv.FRONTEND_URL}/admin/set-password/${token}`,
      },
      locale,
    );
  }

  async validateActivationToken(token: string): Promise<{
    valid: boolean;
    userId?: string;
    sysAdminId?: string;
  }> {
    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      return { valid: false };
    }

    if (tokenRecord.type !== 'ACTIVATION') {
      return { valid: false };
    }

    if (tokenRecord.usedAt) {
      return { valid: false };
    }

    if (tokenRecord.expiresAt < new Date()) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: tokenRecord.userId || undefined,
      sysAdminId: tokenRecord.sysAdminId || undefined,
    };
  }

  async setPasswordWithActivationToken(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const validation = await this.validateActivationToken(token);

    if (!validation.valid) {
      throw new BadRequestException('Invalid or expired activation token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (validation.userId) {
      await this.prisma.user.update({
        where: { id: validation.userId },
        data: { password: hashedPassword },
      });

      await this.prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      });
    } else if (validation.sysAdminId) {
      await this.prisma.sysAdmin.update({
        where: { id: validation.sysAdminId },
        data: { password: hashedPassword },
      });

      await this.prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      });
    } else {
      throw new BadRequestException('Invalid token');
    }
  }

  async resetPasswordWithJwt(
    token: string,
    newPassword: string,
  ): Promise<void> {
    let payload: PasswordResetPayload;

    try {
      payload = await this.jwtService.verifyAsync<PasswordResetPayload>(token, {
        secret: appEnv.AUTH_JWT_SECRET,
      });
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (payload.type === 'USER') {
      await this.prisma.user.update({
        where: { id: payload.userId },
        data: { password: hashedPassword },
      });
    } else {
      await this.prisma.sysAdmin.update({
        where: { id: payload.sysAdminId },
        data: { password: hashedPassword },
      });
    }
  }

  async requestPasswordReset(
    email: string,
    companyId: string | null,
    locale: Locale = 'en',
  ): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    if (companyId) {
      const user = await this.prisma.user.findUnique({
        where: {
          companyId_email: { companyId, email: normalizedEmail },
        },
        include: { company: true },
      });

      if (!user) return;

      const payload: PasswordResetUserPayload = {
        userId: user.id,
        companyId: user.companyId,
        email: normalizedEmail,
        type: 'USER',
      };

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '30m',
      });

      const urlParts = appEnv.FRONTEND_URL.split('://');
      const protocol = urlParts[0];
      const domain = urlParts[1].replace(/\/$/, '');
      const resetUrl = `${protocol}://${user.company.slug}.${domain}/reset-password/${token}`;

      await this.emailService.sendPasswordResetEmail(
        user.email,
        {
          userName: user.name || 'User',
          companyName: user.company.name,
          resetUrl,
        },
        locale,
      );
    } else {
      const sysAdmin = await this.prisma.sysAdmin.findUnique({
        where: { email: normalizedEmail },
      });

      if (!sysAdmin) return;

      const payload: PasswordResetSysAdminPayload = {
        sysAdminId: sysAdmin.id,
        email: normalizedEmail,
        type: 'SYSADMIN',
      };

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '30m',
      });

      const resetUrl = `${appEnv.FRONTEND_URL}/admin/reset-password/${token}`;

      await this.emailService.sendPasswordResetEmail(
        sysAdmin.email,
        {
          userName: 'Admin',
          companyName: 'Titans Tech Admin Portal',
          resetUrl,
        },
        locale,
      );
    }
  }

  async resendActivationEmail(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        type: 'ACTIVATION',
        usedAt: null,
      },
    });

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.passwordResetToken.create({
      data: {
        token,
        type: 'ACTIVATION',
        userId: user.id,
        expiresAt,
      },
    });

    const urlParts = appEnv.FRONTEND_URL.split('://');
    const protocol = urlParts[0];
    const domain = urlParts[1].replace(/\/$/, '');
    const activationUrl = `${protocol}://${user.company.slug}.${domain}/set-password/${token}`;

    await this.emailService.sendPasswordActivationEmail(
      user.email,
      {
        userName: user.name || 'User',
        companyName: user.company.name,
        activationUrl,
      },
      'en',
    );
  }

  async checkPendingActivation(userId: string): Promise<boolean> {
    const anyToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId,
        type: 'ACTIVATION',
      },
    });

    if (!anyToken) return false;

    const usedToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId,
        type: 'ACTIVATION',
        usedAt: { not: null },
      },
    });

    return usedToken ? false : true;
  }

  async checkSysAdminPendingActivation(sysAdminId: string): Promise<boolean> {
    const anyToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        sysAdminId,
        type: 'ACTIVATION',
      },
    });

    if (!anyToken) return false;

    const usedToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        sysAdminId,
        type: 'ACTIVATION',
        usedAt: { not: null },
      },
    });

    return usedToken ? false : true;
  }
}
