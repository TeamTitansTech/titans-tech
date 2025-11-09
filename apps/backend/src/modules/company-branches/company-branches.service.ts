import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateCompanyBranchDto,
  UpdateCompanyBranchDto,
  SetUserPermissionsDto,
  UserResponseDto,
} from '@titans-tech/shared';

@Injectable()
export class CompanyBranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.companyBranch.findMany({
      where: { companyId },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.companyBranch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async create(companyId: string, createBranchDto: CreateCompanyBranchDto) {
    return this.prisma.companyBranch.create({
      data: {
        ...createBranchDto,
        companyId,
      },
    });
  }

  async update(id: string, updateBranchDto: UpdateCompanyBranchDto) {
    const branch = await this.prisma.companyBranch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.companyBranch.update({
      where: { id },
      data: updateBranchDto,
    });
  }

  async remove(id: string) {
    const branch = await this.prisma.companyBranch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    await this.prisma.companyBranch.delete({
      where: { id },
    });

    return { success: true };
  }

  async setUserPermissions(
    branchId: string,
    userId: string,
    permissionsDto: SetUserPermissionsDto,
  ) {
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

    await this.prisma.userBranch.update({
      where: {
        userId_branchId: {
          userId,
          branchId,
        },
      },
      data: permissionsDto,
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
}
