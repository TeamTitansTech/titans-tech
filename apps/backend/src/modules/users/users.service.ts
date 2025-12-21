import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { CompanyLimitsService } from '../shared/company-limits.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  SysAdminCreateUserDto,
  UserResponseDto,
  SetCompanyAdminDto,
} from '@titans-tech/shared/backend-dtos';
import {
  type Permissions,
  MANAGER_PERMISSIONS,
} from '@titans-tech/shared/types/permissions';
import * as bcrypt from 'bcrypt';
import { FieldsErr } from 'src/errors/err';
import { isSysAdmin, JwtPayload, UserJwtPayload } from 'src/types/request';
import { JwtService } from '@nestjs/jwt';
import { NotificationsService } from '../notifications/notifications.service';

const defaultPassword = 'password';
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
    private readonly companyLimitsService: CompanyLimitsService,
  ) {}

  async login(email: string, password: string, companyId: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        companyId,
      },
      include: {
        branches: {
          where: { deletedAt: null },
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid credentials');
    }

    const payload: UserJwtPayload = {
      id: user.id,
      companyId: user.companyId,
      isSysAdmin: false,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: new UserResponseDto(user),
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        branches: {
          where: {
            deletedAt: null,
          },
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If user is company admin, they have access to all branches
    // We need to populate the branches array with all company branches
    if (user.isCompanyAdmin) {
      const allBranches = await this.prisma.companyBranch.findMany({
        where: { companyId: user.companyId },
      });

      // Create UserBranch objects with full permissions for admins/managers
      const userBranches = allBranches.map((branch) => ({
        userId: user.id,
        branchId: branch.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Grant all permissions (using MANAGER_PERMISSIONS as source of truth)
        ...MANAGER_PERMISSIONS,
        branch: branch,
      }));

      const userResponse = new UserResponseDto({
        ...user,
        branches: userBranches,
      });

      // Buscar quantidade de notificações não lidas
      const unreadNotifications = await this.prisma.notificationRecipient.count(
        {
          where: {
            recipientId: userId,
            isRead: false,
          },
        },
      );

      userResponse.unreadNotifications = unreadNotifications;

      return userResponse;
    }

    // Buscar quantidade de notificações não lidas
    const unreadNotifications = await this.prisma.notificationRecipient.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });

    const userResponse = new UserResponseDto(user);
    userResponse.unreadNotifications = unreadNotifications;

    return userResponse;
  }

  async findAll(companyId: string) {
    // Use originalPrismaClient to include soft-deleted users for the deactivation feature
    const users = await this.prisma.originalPrismaClient.user.findMany({
      where: { companyId },
      include: {
        branches: {
          // Don't need to filter deleted branches here because we use soft delete as deactivation feature
          include: {
            branch: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => new UserResponseDto(user));
  }

  async findOne(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
      include: {
        branches: {
          where: {
            deletedAt: null,
          },
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserResponseDto(user);
  }

  async sysAdminCreateUser(
    branchId: string,
    createUserDto: SysAdminCreateUserDto,
  ) {
    const normalizedEmail = createUserDto.email.toLowerCase().trim();

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const branch = await this.prisma.companyBranch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    if (existingUser) {
      throw FieldsErr({ email: 'Email already in use' });
    }

    await this.companyLimitsService.enforceUserLimit(branch.companyId);

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: createUserDto.name,
          isCompanyAdmin: createUserDto.isCompanyAdmin ?? false,
          password: hashedPassword,
          isUsingDefaultPassword: true,
          companyId: branch.companyId,
        },
        include: {
          branches: {
            where: { deletedAt: null },
            include: {
              branch: true,
            },
          },
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
            where: { deletedAt: null },
            include: {
              branch: true,
            },
          },
        },
      });
    });
    return new UserResponseDto(result);
  }

  async createWithBranch(branchId: string, createUserDto: CreateUserDto) {
    const normalizedEmail = createUserDto.email.toLowerCase().trim();

    const branch = await this.prisma.companyBranch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw FieldsErr({ email: 'Email already in use' });
    }

    await this.companyLimitsService.enforceUserLimit(branch.companyId);

    const defaultPassword = 'password';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
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
            where: { deletedAt: null },
            include: {
              branch: true,
            },
          },
        },
      });
    });

    return new UserResponseDto(result);
  }

  async update(id: string, companyId: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { id, companyId },
      include: {
        branches: {
          where: { deletedAt: null },
          include: {
            branch: true,
          },
        },
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.validateEmailUniqueness(updateUserDto, existingUser);

    // Normalize email to lowercase if provided
    const dataToUpdate = {
      ...updateUserDto,
      ...(updateUserDto.email && {
        email: updateUserDto.email.toLowerCase().trim(),
      }),
    };

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: {
        branches: {
          where: { deletedAt: null },
          include: {
            branch: true,
          },
        },
      },
    });

    return new UserResponseDto(updatedUser);
  }

  async updatePassword(userId: string, data: UpdatePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      user.isUsingDefaultPassword ? defaultPassword : data.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new ForbiddenException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        isUsingDefaultPassword: false,
      },
      include: {
        branches: {
          where: { deletedAt: null },
          include: {
            branch: true,
          },
        },
      },
    });

    return new UserResponseDto(updatedUser);
  }

  async addUserToBranch(branchId: string, userId: string) {
    const branch = await this.prisma.companyBranch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.companyId !== branch.companyId) {
      throw new ForbiddenException(
        'User does not belong to the same company as the branch',
      );
    }

    const existingUserBranch = await this.prisma.userBranch.findUnique({
      where: {
        userId_branchId: {
          userId,
          branchId,
        },
      },
    });

    if (existingUserBranch) {
      throw new ForbiddenException('User is already assigned to this branch');
    }

    await this.prisma.userBranch.create({
      data: {
        userId,
        branchId,
      },
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        branches: {
          where: { deletedAt: null },
          include: {
            branch: true,
          },
        },
      },
    });

    return new UserResponseDto(updatedUser);
  }

  async removeUserFromBranch(branchId: string, userId: string) {
    const userBranch = await this.prisma.userBranch.findUnique({
      where: {
        userId_branchId: {
          userId,
          branchId,
        },
      },
    });

    if (!userBranch) {
      throw new NotFoundException('User is not assigned to this branch');
    }

    await this.prisma.userBranch.delete({
      where: {
        userId_branchId: {
          userId,
          branchId,
        },
      },
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        branches: {
          where: { deletedAt: null },
          include: {
            branch: true,
          },
        },
      },
    });

    return new UserResponseDto(updatedUser);
  }

  private async validateEmailUniqueness(
    updateUserDto: UpdateUserDto,
    existingUser: { email: string },
  ): Promise<void> {
    if (updateUserDto.email) {
      const normalizedEmail = updateUserDto.email.toLowerCase().trim();
      if (normalizedEmail !== existingUser.email) {
        const emailInUse = await this.prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (emailInUse) {
          throw FieldsErr({ email: 'Email already in use' });
        }
      }
    }
  }

  async setCompanyAdmin(
    userId: string,
    dto: SetCompanyAdminDto,
    userPayload: JwtPayload,
  ) {
    if (!isSysAdmin(userPayload)) {
      throw new ForbiddenException(
        'Only system administrators can change company admin status',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If promoting to Company Admin, ensure only one admin per company
    if (dto.isCompanyAdmin === true && !user.isCompanyAdmin) {
      const existingAdmin = await this.prisma.user.findFirst({
        where: {
          companyId: user.companyId,
          isCompanyAdmin: true,
        },
      });

      if (existingAdmin) {
        throw new ForbiddenException(
          `Company already has an admin: ${existingAdmin.name} (${existingAdmin.email}). ` +
            'There can only be one Company Administrator per company. ' +
            'Please demote the existing admin first.',
        );
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isCompanyAdmin: dto.isCompanyAdmin,
      },
      include: {
        branches: {
          where: { deletedAt: null },
          include: {
            branch: true,
          },
        },
      },
    });

    return new UserResponseDto(updatedUser);
  }

  /**
   * Delete user from company or remove from specific branch
   */
  async deleteUser(
    userId: string,
    scope: 'branch' | 'company',
    branchId?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { branches: { where: { deletedAt: null } } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent deletion of Company Admin
    if (user.isCompanyAdmin) {
      throw new ForbiddenException(
        'Cannot delete Company Administrator. Please remove admin status first.',
      );
    }

    if (scope === 'branch' && branchId) {
      console.debug(`Deleting user ${userId} from branch ${branchId}`);
      // Remove user from specific branch only
      await this.prisma.userBranch.delete({
        where: {
          userId_branchId: {
            userId,
            branchId,
          },
        },
      });

      // Check if user has any remaining branches
      const remainingBranches = await this.prisma.userBranch.count({
        where: { userId },
      });

      // If no remaining branches, delete the user completely to free up email
      if (remainingBranches === 0) {
        await this.prisma.user.delete({
          where: { id: userId },
        });

        return {
          success: true,
          message: 'User deleted from company (no remaining branches)',
        };
      }

      return {
        success: true,
        message: 'User removed from branch',
      };
    } else {
      // Delete user completely from company
      // First delete all UserBranch records
      await this.prisma.userBranch.deleteMany({
        where: { userId },
      });

      // Then delete the user
      await this.prisma.user.delete({
        where: { id: userId },
      });

      return {
        success: true,
        message: 'User deleted from company',
      };
    }
  }

  /**
   * Reactivate user from company or specific branch (restore from soft delete)
   */
  async reactivateUser(
    userId: string,
    scope: 'branch' | 'company',
    branchId?: string,
  ) {
    const user = await this.prisma.originalPrismaClient.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        branches: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (scope === 'branch' && branchId) {
      console.debug(`Reactivating user ${userId} for branch ${branchId}`);

      const userBranch =
        await this.prisma.originalPrismaClient.userBranch.findUnique({
          where: {
            userId_branchId: {
              userId,
              branchId,
            },
          },
        });

      if (!userBranch) {
        throw new NotFoundException('User is not assigned to this branch');
      }

      await this.prisma.userBranch.update({
        where: {
          userId_branchId: {
            userId,
            branchId,
          },
        },
        data: {
          deletedAt: null,
        },
      });

      if (user.deletedAt) {
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            deletedAt: null,
          },
        });
      }

      return {
        success: true,
        message: 'User reactivated for branch',
      };
    } else {
      await this.prisma.userBranch.updateMany({
        where: { userId },
        data: {
          deletedAt: null,
        },
      });

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: null,
        },
      });

      return {
        success: true,
        message: 'User reactivated for company',
      };
    }
  }

  /**
   * Update user permissions across all branches they belong to
   */
  async updateUserPermissionsAllBranches(
    userId: string,
    companyId: string,
    permissions: Partial<Permissions>,
  ) {
    // Verify user belongs to company
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { branches: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.companyId !== companyId) {
      throw new ForbiddenException('User does not belong to this company');
    }

    // Update all UserBranch records for this user
    const updatePromises = user.branches.map((userBranch) =>
      this.prisma.userBranch.update({
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

    // Return updated user
    return this.getMe(userId);
  }
}
