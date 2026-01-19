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
  ActivationUserPayload,
  ActivationSysAdminPayload,
  ActivationPayload,
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
    companyId: string,
    locale: Locale = 'en',
  ): Promise<void> {
    const tokenId = this.generateToken();

    await this.prisma.user.update({
      where: { id: userId },
      data: { ephemeralResetPasswordTokenId: tokenId },
    });

    const payload: ActivationUserPayload = {
      userId,
      companyId,
      email: userEmail,
      tokenId,
      type: 'USER_ACTIVATION',
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
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
    const tokenId = this.generateToken();

    await this.prisma.sysAdmin.update({
      where: { id: sysAdminId },
      data: { ephemeralResetPasswordTokenId: tokenId },
    });

    const payload: ActivationSysAdminPayload = {
      sysAdminId,
      email: sysAdminEmail,
      tokenId,
      type: 'SYSADMIN_ACTIVATION',
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
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

  async setPasswordWithActivationToken(
    token: string,
    newPassword: string,
  ): Promise<void> {
    let payload: ActivationPayload;

    try {
      payload = await this.jwtService.verifyAsync<ActivationPayload>(token);
    } catch {
      throw new BadRequestException('Invalid or expired activation token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (payload.type === 'USER_ACTIVATION') {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.ephemeralResetPasswordTokenId !== payload.tokenId) {
        throw new BadRequestException('Invalid or expired activation token');
      }

      await this.prisma.user.update({
        where: { id: payload.userId },
        data: {
          password: hashedPassword,
          ephemeralResetPasswordTokenId: null,
        },
      });
    } else {
      const sysAdmin = await this.prisma.sysAdmin.findUnique({
        where: { id: payload.sysAdminId },
      });

      if (
        !sysAdmin ||
        sysAdmin.ephemeralResetPasswordTokenId !== payload.tokenId
      ) {
        throw new BadRequestException('Invalid or expired activation token');
      }

      await this.prisma.sysAdmin.update({
        where: { id: payload.sysAdminId },
        data: {
          password: hashedPassword,
          ephemeralResetPasswordTokenId: null,
        },
      });
    }
  }

  async resetPasswordWithJwt(
    token: string,
    newPassword: string,
  ): Promise<void> {
    let payload: PasswordResetPayload;

    try {
      payload = await this.jwtService.verifyAsync<PasswordResetPayload>(token);
    } catch {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (payload.type === 'USER') {
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || user.ephemeralResetPasswordTokenId !== payload.tokenId) {
        throw new BadRequestException('Invalid or expired token');
      }

      await this.prisma.user.update({
        where: { id: payload.userId },
        data: {
          password: hashedPassword,
          ephemeralResetPasswordTokenId: null,
        },
      });
    } else {
      const sysAdmin = await this.prisma.sysAdmin.findUnique({
        where: { id: payload.sysAdminId },
      });

      if (
        !sysAdmin ||
        sysAdmin.ephemeralResetPasswordTokenId !== payload.tokenId
      ) {
        throw new BadRequestException('Invalid or expired token');
      }

      await this.prisma.sysAdmin.update({
        where: { id: payload.sysAdminId },
        data: {
          password: hashedPassword,
          ephemeralResetPasswordTokenId: null,
        },
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

      const tokenId = this.generateToken();

      await this.prisma.user.update({
        where: { id: user.id },
        data: { ephemeralResetPasswordTokenId: tokenId },
      });

      const payload: PasswordResetUserPayload = {
        userId: user.id,
        companyId: user.companyId,
        email: normalizedEmail,
        tokenId,
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

      const tokenId = this.generateToken();

      await this.prisma.sysAdmin.update({
        where: { id: sysAdmin.id },
        data: { ephemeralResetPasswordTokenId: tokenId },
      });

      const payload: PasswordResetSysAdminPayload = {
        sysAdminId: sysAdmin.id,
        email: normalizedEmail,
        tokenId,
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

    const tokenId = this.generateToken();

    await this.prisma.user.update({
      where: { id: user.id },
      data: { ephemeralResetPasswordTokenId: tokenId },
    });

    const payload: ActivationUserPayload = {
      userId: user.id,
      companyId: user.companyId,
      email: user.email,
      tokenId,
      type: 'USER_ACTIVATION',
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { ephemeralResetPasswordTokenId: true },
    });

    return (
      user?.ephemeralResetPasswordTokenId !== null &&
      user?.ephemeralResetPasswordTokenId !== undefined
    );
  }

  async checkSysAdminPendingActivation(sysAdminId: string): Promise<boolean> {
    const sysAdmin = await this.prisma.sysAdmin.findUnique({
      where: { id: sysAdminId },
      select: { ephemeralResetPasswordTokenId: true },
    });

    return (
      sysAdmin?.ephemeralResetPasswordTokenId !== null &&
      sysAdmin?.ephemeralResetPasswordTokenId !== undefined
    );
  }

  async validateActivationToken(token: string): Promise<{
    valid: boolean;
    userId?: string;
    sysAdminId?: string;
  }> {
    try {
      const payload =
        await this.jwtService.verifyAsync<ActivationPayload>(token);

      if (payload.type === 'USER_ACTIVATION') {
        const user = await this.prisma.user.findUnique({
          where: { id: payload.userId },
          select: { ephemeralResetPasswordTokenId: true },
        });

        if (!user || user.ephemeralResetPasswordTokenId !== payload.tokenId) {
          return { valid: false };
        }

        return { valid: true, userId: payload.userId };
      } else {
        const sysAdmin = await this.prisma.sysAdmin.findUnique({
          where: { id: payload.sysAdminId },
          select: { ephemeralResetPasswordTokenId: true },
        });

        if (
          !sysAdmin ||
          sysAdmin.ephemeralResetPasswordTokenId !== payload.tokenId
        ) {
          return { valid: false };
        }

        return { valid: true, sysAdminId: payload.sysAdminId };
      }
    } catch {
      return { valid: false };
    }
  }
}
