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
} from '@titans-tech/shared';
import * as bcrypt from 'bcrypt';
import { FieldsErr } from 'src/errors/err';
import { isSysAdmin, JwtPayload, UserJwtPayload } from 'src/types/request';
import { JwtService } from '@nestjs/jwt';

const defaultPassword = 'password';
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
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
      isCompanyAdmin: user.isCompanyAdmin,
      isCompanyManager: user.isCompanyManager,
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

    return new UserResponseDto(user);
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
    companyId: string,
    createUserDto: SysAdminCreateUserDto,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw FieldsErr({ email: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        isCompanyAdmin: createUserDto.isCompanyAdmin ?? false,
        password: hashedPassword,
        isUsingDefaultPassword: true,
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

    return new UserResponseDto(user);
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

  async update(
    id: string,
    companyId: string,
    updateUserDto: UpdateUserDto,
    userPayload: JwtPayload,
  ) {
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

    this.validateCompanyAdminStatusChange(
      updateUserDto,
      existingUser,
      userPayload,
    );
    this.validateManagerStatusRemoval(updateUserDto, existingUser, userPayload);
    await this.validateEmailUniqueness(updateUserDto, existingUser);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        isCompanyAdmin: isSysAdmin(userPayload)
          ? updateUserDto.isCompanyAdmin
          : undefined,
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

  private validateCompanyAdminStatusChange(
    updateUserDto: UpdateUserDto,
    existingUser: { isCompanyAdmin: boolean },
    userPayload: JwtPayload,
  ): void {
    if (
      updateUserDto.isCompanyAdmin !== undefined &&
      updateUserDto.isCompanyAdmin !== existingUser.isCompanyAdmin
    ) {
      if (!isSysAdmin(userPayload)) {
        throw new ForbiddenException(
          'Only system administrators can change company admin status',
        );
      }
    }
  }

  private validateManagerStatusRemoval(
    updateUserDto: UpdateUserDto,
    existingUser: { isCompanyManager: boolean },
    userPayload: JwtPayload,
  ): void {
    if (
      updateUserDto.isCompanyManager !== undefined &&
      updateUserDto.isCompanyManager === false &&
      existingUser.isCompanyManager
    ) {
      if (!isSysAdmin(userPayload)) {
        const currentUser = userPayload as UserJwtPayload;
        if (!currentUser.isCompanyAdmin) {
          throw new ForbiddenException(
            'Only company administrators or system administrators can remove manager status',
          );
        }
      }
    }
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
}
