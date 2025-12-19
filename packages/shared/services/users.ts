import { PrismaClient, Prisma } from '@titans-tech/db';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  SysAdminCreateUserDto,
} from '@titans-tech/shared/backend-dtos';
import { type Permissions, MANAGER_PERMISSIONS } from '@titans-tech/shared/types/permissions';
import * as bcrypt from 'bcrypt';

const DEFAULT_PASSWORD = 'password';

/**
 * Login with email and password for a company
 */
export async function loginUser(
  prisma: PrismaClient,
  email: string,
  password: string,
  companyId: string,
): Promise<{
  data: {
    user: any;
  } | null;
  error?: { type: string; message: string };
}> {
  const user = await prisma.user.findFirst({
    where: {
      email,
      companyId,
    },
    include: {
      branches: {
        include: {
          branch: true,
        },
      },
    },
  });

  if (!user) {
    return {
      data: null,
      error: { type: 'FORBIDDEN', message: 'Invalid credentials' },
    };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return {
      data: null,
      error: { type: 'FORBIDDEN', message: 'Invalid credentials' },
    };
  }

  return {
    data: { user },
  };
}

/**
 * Get user by ID with unread notification count
 */
export async function getUserById(
  prisma: PrismaClient,
  userId: string,
): Promise<{
  data: {
    user: any;
    unreadNotifications: number;
  } | null;
  error?: { type: string; message: string };
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      branches: {
        include: {
          branch: true,
        },
      },
    },
  });

  if (!user) {
    return {
      data: null,
      error: { type: 'NOT_FOUND', message: 'User not found' },
    };
  }

  // If user is company admin, populate all company branches
  let userWithBranches = user;
  if (user.isCompanyAdmin) {
    const allBranches = await prisma.companyBranch.findMany({
      where: { companyId: user.companyId },
    });

    userWithBranches = {
      ...user,
      branches: allBranches.map((branch) => ({
        userId: user.id,
        branchId: branch.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        ...MANAGER_PERMISSIONS,
        branch,
      })),
    };
  }

  // Count unread notifications
  const unreadNotifications = await prisma.notificationRecipient.count({
    where: {
      recipientId: userId,
      isRead: false,
    },
  });

  return {
    data: {
      user: userWithBranches,
      unreadNotifications,
    },
  };
}

/**
 * Find all users for a company
 */
export async function findAllUsers(prisma: PrismaClient, companyId: string): Promise<any[]> {
  return prisma.user.findMany({
    where: { companyId },
    include: {
      branches: {
        include: {
          branch: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Find one user by ID and company
 */
export async function findOneUser(
  prisma: PrismaClient,
  id: string,
  companyId: string,
): Promise<{
  data: any | null;
  error?: { type: string; message: string };
}> {
  const user = await prisma.user.findFirst({
    where: { id, companyId },
    include: {
      branches: {
        include: {
          branch: true,
        },
      },
    },
  });

  if (!user) {
    return {
      data: null,
      error: { type: 'NOT_FOUND', message: 'User not found' },
    };
  }

  return { data: user };
}

/**
 * Create user by system admin
 */
export async function sysAdminCreateUser(
  prisma: PrismaClient,
  branchId: string,
  createUserDto: SysAdminCreateUserDto,
): Promise<{
  data: any | null;
  error?: { type: string; message: string; fieldErrors?: Record<string, string> };
}> {
  const branch = await prisma.companyBranch.findUnique({
    where: { id: branchId },
  });

  if (!branch) {
    return {
      data: null,
      error: { type: 'NOT_FOUND', message: 'Branch not found' },
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: createUserDto.email },
  });

  if (existingUser) {
    return {
      data: null,
      error: {
        type: 'FIELD_ERROR',
        message: 'Email already in use',
        fieldErrors: { email: 'Email already in use' },
      },
    };
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        isCompanyAdmin: createUserDto.isCompanyAdmin ?? false,
        password: hashedPassword,
        isUsingDefaultPassword: true,
        companyId: branch.companyId,
      },
    });

    await tx.userBranch.create({
      data: {
        userId: user.id,
        branchId,
      },
    });

    return tx.user.findUnique({
      where: { id: user.id },
      include: {
        branches: {
          include: {
            branch: true,
          },
        },
      },
    });
  });

  return { data: result };
}

/**
 * Create user with branch assignment
 */
export async function createUserWithBranch(
  prisma: PrismaClient,
  branchId: string,
  createUserDto: CreateUserDto,
): Promise<{
  data: any | null;
  error?: { type: string; message: string; fieldErrors?: Record<string, string> };
}> {
  const branch = await prisma.companyBranch.findUnique({
    where: { id: branchId },
  });

  if (!branch) {
    return {
      data: null,
      error: { type: 'NOT_FOUND', message: 'Branch not found' },
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: createUserDto.email },
  });

  if (existingUser) {
    return {
      data: null,
      error: {
        type: 'FIELD_ERROR',
        message: 'Email already in use',
        fieldErrors: { email: 'Email already in use' },
      },
    };
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        isUsingDefaultPassword: true,
        companyId: branch.companyId,
      },
    });

    await tx.userBranch.create({
      data: {
        userId: user.id,
        branchId,
      },
    });

    return tx.user.findUnique({
      where: { id: user.id },
      include: {
        branches: {
          include: {
            branch: true,
          },
        },
      },
    });
  });

  return { data: result };
}

/**
 * Update user
 */
export async function updateUser(
  prisma: PrismaClient,
  id: string,
  companyId: string,
  updateUserDto: UpdateUserDto,
): Promise<{
  data: any | null;
  error?: { type: string; message: string; fieldErrors?: Record<string, string> };
}> {
  const existingUser = await prisma.user.findFirst({
    where: { id, companyId },
    include: {
      branches: {
        include: {
          branch: true,
        },
      },
    },
  });

  if (!existingUser) {
    return {
      data: null,
      error: { type: 'NOT_FOUND', message: 'User not found' },
    };
  }

  // Validate email uniqueness
  if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
    const emailInUse = await prisma.user.findUnique({
      where: { email: updateUserDto.email },
    });

    if (emailInUse) {
      return {
        data: null,
        error: {
          type: 'FIELD_ERROR',
          message: 'Email already in use',
          fieldErrors: { email: 'Email already in use' },
        },
      };
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateUserDto,
    include: {
      branches: {
        include: {
          branch: true,
        },
      },
    },
  });

  return { data: updatedUser };
}

/**
 * Delete user by ID and company
 */
export async function deleteUser(
  prisma: PrismaClient,
  id: string,
  companyId: string,
): Promise<{ error?: { type: string; message: string } }> {
  const existingUser = await prisma.user.findFirst({
    where: { id, companyId },
  });

  if (!existingUser) {
    return {
      error: { type: 'NOT_FOUND', message: 'User not found' },
    };
  }

  await prisma.user.delete({
    where: { id },
  });

  return {};
}

/**
 * Update user password
 */
export async function updateUserPassword(
  prisma: PrismaClient,
  userId: string,
  data: UpdatePasswordDto,
  currentUser: { isUsingDefaultPassword: boolean; password: string },
): Promise<{
  data: any | null;
  error?: { type: string; message: string };
}> {
  const passwordToVerify = currentUser.isUsingDefaultPassword
    ? DEFAULT_PASSWORD
    : data.currentPassword || '';

  const isCurrentPasswordValid = await bcrypt.compare(passwordToVerify, currentUser.password);

  if (!isCurrentPasswordValid) {
    return {
      data: null,
      error: { type: 'FORBIDDEN', message: 'Current password is incorrect' },
    };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      isUsingDefaultPassword: false,
    },
    include: {
      branches: {
        include: {
          branch: true,
        },
      },
    },
  });

  return { data: updatedUser };
}

/**
 * Add user to branch
 */
export async function addUserToBranch(
  prisma: PrismaClient,
  branchId: string,
  userId: string,
): Promise<{
  data: any | null;
  error?: { type: string; message: string };
}> {
  const branch = await prisma.companyBranch.findUnique({
    where: { id: branchId },
  });

  if (!branch) {
    return {
      data: null,
      error: { type: 'NOT_FOUND', message: 'Branch not found' },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      data: null,
      error: { type: 'NOT_FOUND', message: 'User not found' },
    };
  }

  if (user.companyId !== branch.companyId) {
    return {
      data: null,
      error: {
        type: 'FORBIDDEN',
        message: 'User does not belong to the same company as the branch',
      },
    };
  }

  const existingUserBranch = await prisma.userBranch.findUnique({
    where: {
      userId_branchId: {
        userId,
        branchId,
      },
    },
  });

  if (existingUserBranch) {
    return {
      data: null,
      error: {
        type: 'FORBIDDEN',
        message: 'User is already assigned to this branch',
      },
    };
  }

  await prisma.userBranch.create({
    data: {
      userId,
      branchId,
    },
  });

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      branches: {
        include: {
          branch: true,
        },
      },
    },
  });

  return { data: updatedUser };
}

/**
 * Remove user from branch
 */
export async function removeUserFromBranch(
  prisma: PrismaClient,
  branchId: string,
  userId: string,
): Promise<{
  data: any | null;
  error?: { type: string; message: string };
}> {
  const userBranch = await prisma.userBranch.findUnique({
    where: {
      userId_branchId: {
        userId,
        branchId,
      },
    },
  });

  if (!userBranch) {
    return {
      data: null,
      error: {
        type: 'NOT_FOUND',
        message: 'User is not assigned to this branch',
      },
    };
  }

  await prisma.userBranch.delete({
    where: {
      userId_branchId: {
        userId,
        branchId,
      },
    },
  });

  const updatedUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      branches: {
        include: {
          branch: true,
        },
      },
    },
  });

  return { data: updatedUser };
}

/**
 * Set company admin status
 */
export async function setCompanyAdmin(
  prisma: PrismaClient,
  userId: string,
  isCompanyAdmin: boolean,
): Promise<{
  data: any | null;
  error?: { type: string; message: string };
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      data: null,
      error: { type: 'NOT_FOUND', message: 'User not found' },
    };
  }

  // If promoting to Company Admin, ensure only one admin per company
  if (isCompanyAdmin === true && !user.isCompanyAdmin) {
    const existingAdmin = await prisma.user.findFirst({
      where: {
        companyId: user.companyId,
        isCompanyAdmin: true,
      },
    });

    if (existingAdmin) {
      return {
        data: null,
        error: {
          type: 'FORBIDDEN',
          message:
            `Company already has an admin: ${existingAdmin.name} (${existingAdmin.email}). ` +
            'There can only be one Company Administrator per company. ' +
            'Please demote the existing admin first.',
        },
      };
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isCompanyAdmin,
    },
    include: {
      branches: {
        include: {
          branch: true,
        },
      },
    },
  });

  return { data: updatedUser };
}

/**
 * Delete user from company or branch
 */
export async function deleteUserFromScope(
  prisma: PrismaClient,
  userId: string,
  scope: 'branch' | 'company',
  branchId?: string,
): Promise<{ error?: { type: string; message: string } }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { branches: true },
  });

  if (!user) {
    return {
      error: { type: 'NOT_FOUND', message: 'User not found' },
    };
  }

  // Prevent deletion of Company Admin
  if (user.isCompanyAdmin) {
    return {
      error: {
        type: 'FORBIDDEN',
        message: 'Cannot delete Company Administrator. Please remove admin status first.',
      },
    };
  }

  if (scope === 'branch' && branchId) {
    // Remove user from specific branch only
    await prisma.userBranch.delete({
      where: {
        userId_branchId: {
          userId,
          branchId,
        },
      },
    });

    return {};
  } else {
    // Delete user completely from company
    await prisma.userBranch.deleteMany({
      where: { userId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    return {};
  }
}

/**
 * Update user permissions across all branches
 */
export async function updateUserPermissionsAllBranches(
  prisma: PrismaClient,
  userId: string,
  companyId: string,
  permissions: Partial<Permissions>,
): Promise<{
  error?: { type: string; message: string };
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { branches: true },
  });

  if (!user) {
    return {
      error: { type: 'NOT_FOUND', message: 'User not found' },
    };
  }

  if (user.companyId !== companyId) {
    return {
      error: {
        type: 'FORBIDDEN',
        message: 'User does not belong to this company',
      },
    };
  }

  // Update all UserBranch records for this user
  const updatePromises = user.branches.map((userBranch) =>
    prisma.userBranch.update({
      where: {
        userId_branchId: {
          userId,
          branchId: userBranch.branchId,
        },
      },
      data: permissions,
    }),
  );

  await Promise.all(updatePromises);

  return {};
}
