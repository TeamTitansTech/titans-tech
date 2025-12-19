import { PrismaClient } from '@titans-tech/db';
import { UpdatePasswordDto, LoginDto, SysAdminResponseDto } from '@titans-tech/shared/backend-dtos';
import * as bcrypt from 'bcrypt';

const DEFAULT_PASSWORD = 'password';

/**
 * Login with email and password
 * Returns { data: { sysAdmin, password } } or { error: ... }
 */
export async function loginSysAdmin(
  prisma: PrismaClient,
  loginDto: LoginDto,
): Promise<{
  data: { sysAdmin: any; password: string } | null;
  error?: { type: string; message: string };
}> {
  const { email, password } = loginDto;

  const sysAdmin = await prisma.sysAdmin.findUnique({
    where: { email },
  });

  if (!sysAdmin) {
    return {
      data: null,
      error: { type: 'FORBIDDEN', message: 'Invalid credentials' },
    };
  }

  const isPasswordValid = await bcrypt.compare(password, sysAdmin.password);

  if (!isPasswordValid) {
    return {
      data: null,
      error: { type: 'FORBIDDEN', message: 'Invalid credentials' },
    };
  }

  return {
    data: { sysAdmin, password: sysAdmin.password },
  };
}

/**
 * Get sysadmin by ID with unread notification count
 */
export async function getSysAdminById(
  prisma: PrismaClient,
  userId: string,
): Promise<{
  data: {
    sysAdmin: any;
    unreadNotifications: number;
  } | null;
  error?: { type: string; message: string };
}> {
  const sysAdmin = await prisma.sysAdmin.findUnique({
    where: { id: userId },
  });

  if (!sysAdmin) {
    return {
      data: null,
      error: { type: 'NOT_FOUND', message: 'SysAdmin not found' },
    };
  }

  // Count unread notifications for sysadmin
  const unreadNotifications = await prisma.notificationRecipient.count({
    where: {
      recipientId: userId,
      isRead: false,
    },
  });

  return {
    data: {
      sysAdmin,
      unreadNotifications,
    },
  };
}

/**
 * Update sysadmin password
 */
export async function updateSysAdminPassword(
  prisma: PrismaClient,
  userId: string,
  data: UpdatePasswordDto,
  currentSysAdmin: { isUsingDefaultPassword: boolean; password: string },
): Promise<{
  data: any | null;
  error?: { type: string; message: string };
}> {
  const passwordToVerify = currentSysAdmin.isUsingDefaultPassword
    ? DEFAULT_PASSWORD
    : data.currentPassword || '';

  const isCurrentPasswordValid = await bcrypt.compare(passwordToVerify, currentSysAdmin.password);

  if (!isCurrentPasswordValid) {
    return {
      data: null,
      error: { type: 'FORBIDDEN', message: 'Invalid credentials' },
    };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const updatedSysAdmin = await prisma.sysAdmin.update({
    where: { id: userId },
    data: { password: hashedPassword, isUsingDefaultPassword: false },
  });

  return {
    data: updatedSysAdmin,
  };
}
