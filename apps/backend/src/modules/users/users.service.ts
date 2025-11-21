import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdatePasswordDto,
  SysAdminCreateUserDto,
  UserResponseDto,
  SetCompanyAdminDto,
  SetCompanyManagerDto,
} from '@titans-tech/shared/backend-dtos';
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
  ) {}

  async login(email: string, password: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
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
          include: {
            branch: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const unreadNotifications = 0;

    // If user is company admin or manager, they have access to all branches
    // We need to populate the branches array with all company branches
    if (user.isCompanyAdmin || user.isCompanyManager) {
      const allBranches = await this.prisma.companyBranch.findMany({
        where: { companyId: user.companyId },
      });

      // Create UserBranch objects with full permissions for admins/managers
      const userBranches = allBranches.map((branch) => ({
        userId: user.id,
        branchId: branch.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Grant all permissions
        readUsers: true,
        createUsers: true,
        updateUsers: true,
        deleteUsers: true,
        manageUserPermissions: true,
        assignUsersToBranches: true,
        readBranches: true,
        updateBranches: true,
        readBlueprints: true,
        createBlueprints: true,
        updateBlueprints: true,
        deleteBlueprints: true,
        readMachines: true,
        createMachines: true,
        updateMachines: true,
        deleteMachines: true,
        readServices: true,
        createServices: true,
        updateServices: true,
        deleteServices: true,
        branch: branch,
      }));

      const userResponse = new UserResponseDto({
        ...user,
        branches: userBranches,
      });
      userResponse.unreadNotifications = unreadNotifications;
      return userResponse;
    }

    const userResponse = new UserResponseDto(user);
    userResponse.unreadNotifications = unreadNotifications;
    return userResponse;
  }

  async findAll(companyId: string) {
    const users = await this.prisma.user.findMany({
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

    return users.map((user) => new UserResponseDto(user));
  }

  async findOne(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
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
      throw new NotFoundException('User not found');
    }

    return new UserResponseDto(user);
  }

  async sysAdminCreateUser(
    branchId: string,
    createUserDto: SysAdminCreateUserDto,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
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

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: createUserDto.email,
          name: createUserDto.name,
          isCompanyAdmin: createUserDto.isCompanyAdmin ?? false,
          password: hashedPassword,
          isUsingDefaultPassword: true,
          companyId: branch.companyId,
        },
        include: {
          branches: {
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
    const branch = await this.prisma.companyBranch.findUnique({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw FieldsErr({ email: 'Email already in use' });
    }

    const defaultPassword = 'password';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
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

    return new UserResponseDto(result);
  }

  async update(id: string, companyId: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
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
      throw new NotFoundException('User not found');
    }

    await this.validateEmailUniqueness(updateUserDto, existingUser);

    const updatedUser = await this.prisma.user.update({
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

    return new UserResponseDto(updatedUser);
  }

  async remove(id: string, companyId: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
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
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailInUse = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailInUse) {
        throw FieldsErr({ email: 'Email already in use' });
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
          include: {
            branch: true,
          },
        },
      },
    });

    return new UserResponseDto(updatedUser);
  }

  async setCompanyManager(
    userId: string,
    dto: SetCompanyManagerDto,
    userPayload: JwtPayload,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.isCompanyManager === false && user.isCompanyManager) {
      if (!isSysAdmin(userPayload)) {
        const currentUser = await this.prisma.user.findUnique({
          where: { id: userPayload.id },
        });
        if (!currentUser.isCompanyAdmin) {
          throw new ForbiddenException(
            'Only company administrators or system administrators can remove manager status',
          );
        }
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        isCompanyManager: dto.isCompanyManager,
      },
      include: {
        branches: {
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
      include: { branches: true },
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
      // Remove user from specific branch only
      await this.prisma.userBranch.delete({
        where: {
          userId_branchId: {
            userId,
            branchId,
          },
        },
      });

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
   * Update user permissions across all branches they belong to
   */
  async updateUserPermissionsAllBranches(
    userId: string,
    companyId: string,
    permissions: Partial<{
      readUsers: boolean;
      createUsers: boolean;
      updateUsers: boolean;
      deleteUsers: boolean;
      manageUserPermissions: boolean;
      assignUsersToBranches: boolean;
      readBranches: boolean;
      updateBranches: boolean;
      readBlueprints: boolean;
      createBlueprints: boolean;
      updateBlueprints: boolean;
      deleteBlueprints: boolean;
      readMachines: boolean;
      createMachines: boolean;
      updateMachines: boolean;
      deleteMachines: boolean;
      readServices: boolean;
      createServices: boolean;
      updateServices: boolean;
      deleteServices: boolean;
    }>,
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
