import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateCompanyBranchDto,
  UpdateCompanyBranchDto,
  SetUserPermissionsDto,
  UserResponseDto,
} from '@titans-tech/shared';
import { Prisma } from '@titans-tech/db';

@Injectable()
export class CompanyBranchesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.companyBranch.findMany({
      where: { companyId },
      include: {
        _count: {
          select: {
            machines: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.companyBranch.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            machines: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async create(companyId: string, createBranchDto: CreateCompanyBranchDto) {
    if (createBranchDto.isMainBranch) {
      return this.prisma.$transaction(async (tx) => {
        await this.unsetOtherMainBranches(tx, companyId);
        return tx.companyBranch.create({
          data: {
            ...createBranchDto,
            companyId,
          },
        });
      });
    }

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

    if (updateBranchDto.isMainBranch === true) {
      return this.prisma.$transaction(async (tx) => {
        await this.unsetOtherMainBranches(tx, branch.companyId, id);
        return tx.companyBranch.update({
          where: { id },
          data: updateBranchDto,
        });
      });
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

  async getMachines(
    branchId: string,
  ): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>[]
  > {
    const branch = await this.prisma.companyBranch.findUnique({
      where: { id: branchId },
      include: {
        machines: {
          include: {
            blueprint: true,
            fields: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch.machines;
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

  private async unsetOtherMainBranches(
    tx: any,
    companyId: string,
    excludeBranchId?: string,
  ) {
    await tx.companyBranch.updateMany({
      where: {
        companyId,
        isMainBranch: true,
        ...(excludeBranchId && {
          NOT: {
            id: excludeBranchId,
          },
        }),
      },
      data: {
        isMainBranch: false,
      },
    });
  }
}
