import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import type { Locale } from '../email/templates/i18n';
import { appEnv } from '../../config/env';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
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

    // Construct URL at root domain with subdomain as query param
    const activationUrl = `${appEnv.FRONTEND_URL}/set-password/${token}?subdomain=${companySlug}`;

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

  async validateToken(token: string): Promise<{
    valid: boolean;
    type?: 'ACTIVATION' | 'RESET';
    userType?: 'user' | 'sysAdmin';
    message?: string;
  }> {
    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      return { valid: false, message: 'Invalid token' };
    }

    if (tokenRecord.usedAt) {
      return { valid: false, message: 'Token has already been used' };
    }

    if (new Date() > tokenRecord.expiresAt) {
      return { valid: false, message: 'Token has expired' };
    }

    return {
      valid: true,
      type: tokenRecord.type,
      userType: tokenRecord.userId ? 'user' : 'sysAdmin',
    };
  }

  /**
   * Set password via activation/reset token
   */
  async setPasswordWithToken(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const validation = await this.validateToken(token);

    if (!validation.valid) {
      throw new BadRequestException(validation.message);
    }

    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction(async (tx) => {
      if (tokenRecord.userId) {
        await tx.user.update({
          where: { id: tokenRecord.userId },
          data: {
            password: hashedPassword,
          },
        });
      } else if (tokenRecord.sysAdminId) {
        await tx.sysAdmin.update({
          where: { id: tokenRecord.sysAdminId },
          data: {
            password: hashedPassword,
          },
        });
      }

      await tx.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      });
    });
  }

  async requestPasswordReset(
    email: string,
    isAdmin: boolean = false,
    locale: Locale = 'en',
  ): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = isAdmin
      ? await this.prisma.sysAdmin.findUnique({
          where: { email: normalizedEmail },
        })
      : await this.prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { company: true },
        });

    if (!user) {
      return;
    }

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.passwordResetToken.create({
      data: {
        token,
        type: 'RESET',
        ...(isAdmin ? { sysAdminId: user.id } : { userId: user.id }),
        expiresAt,
      },
    });

    let resetUrl: string;
    let companyName: string;
    if (isAdmin) {
      resetUrl = `${appEnv.FRONTEND_URL}/reset-password/${token}`;
      companyName = 'Admin Portal';
    } else {
      // For regular users, use root domain with subdomain query param
      const companySlug = 'company' in user ? (user as any).company.slug : '';
      resetUrl = `${appEnv.FRONTEND_URL}/reset-password/${token}?subdomain=${companySlug}`;
      companyName = 'company' in user ? (user as any).company.name : 'Portal';
    }

    const userName: string =
      'name' in user ? (user.name as string | null) || 'User' : 'Admin';

    await this.emailService.sendPasswordResetEmail(
      normalizedEmail,
      { userName, companyName, resetUrl },
      locale,
    );
  }

  async resendActivationEmail(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Delete any existing unused activation tokens for this user
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        type: 'ACTIVATION',
        usedAt: null,
      },
    });

    // Create new activation token
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

    // Send activation email at root domain with subdomain as query param
    const activationUrl = `${appEnv.FRONTEND_URL}/set-password/${token}?subdomain=${user.company.slug}`;

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
    // Check if user has any activation tokens at all
    const anyToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId,
        type: 'ACTIVATION',
      },
    });

    // If no activation token exists, this is an old user - no activation needed
    if (!anyToken) {
      return false;
    }

    // User has activation tokens, check if any have been used
    const usedToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId,
        type: 'ACTIVATION',
        usedAt: { not: null },
      },
    });

    // If has used token, activation is complete
    if (usedToken) {
      return false;
    }

    // Has activation token but never used - needs activation
    return true;
  }

  async checkSysAdminPendingActivation(sysAdminId: string): Promise<boolean> {
    // Check if SysAdmin has any activation tokens at all
    const anyToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        sysAdminId,
        type: 'ACTIVATION',
      },
    });

    // If no activation token exists, this is an old admin - no activation needed
    if (!anyToken) {
      return false;
    }

    // SysAdmin has activation tokens, check if any have been used
    const usedToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        sysAdminId,
        type: 'ACTIVATION',
        usedAt: { not: null },
      },
    });

    // If has used token, activation is complete
    if (usedToken) {
      return false;
    }

    // Has activation token but never used - needs activation
    return true;
  }
}
