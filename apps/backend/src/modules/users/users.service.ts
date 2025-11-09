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

    const defaultPassword = 'password';
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

  async createWithBranch(
    companyId: string,
    branchId: string,
    createUserDto: CreateUserDto,
  ) {
    const branch = await this.prisma.companyBranch.findFirst({
      where: { id: branchId, companyId },
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
          companyId,
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
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailInUse = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailInUse) {
        throw FieldsErr({ email: 'Email already in use' });
      }
    }

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

    const isCurrentPasswordValid = user.isUsingDefaultPassword
      ? true
      : await bcrypt.compare(data.currentPassword, user.password);

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
}
