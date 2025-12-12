import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateCompanyBranchDto,
  UpdateCompanyBranchDto,
  SetUserPermissionsDto,
  UserResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { Prisma } from '@titans-tech/db';
import { softDeleteData } from '../shared/soft-delete.utils';

@Injectable()
export class CompanyBranchesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all branches across all companies (SysAdmin only)
   */
  async findAll() {
    return this.prisma.companyBranch.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            machines: true,
          },
        },
      },
      orderBy: [{ company: { name: 'asc' } }, { name: 'asc' }],
    });
  }

  async findAllByCompany(companyId: string) {
    return this.prisma.companyBranch.findMany({
      where: {
        companyId,
        deletedAt: null,
      },
      include: {
        _count: {
          select: {
            machines: true,
            users: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const branch = await this.prisma.companyBranch.findFirst({
      where: {
        id,
        deletedAt: null,
      },
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
    const branch = await this.prisma.companyBranch.findFirst({
      where: {
        id,
        deletedAt: null,
      },
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
    const branch = await this.prisma.companyBranch.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Soft delete branch and cascade to related records
    await this.prisma.$transaction(async (tx) => {
      // Soft delete branch
      await tx.companyBranch.update({
        where: { id },
        data: softDeleteData(),
      });

      // Cascade soft delete to Machines in this branch
      await tx.machine.updateMany({
        where: { branchId: id },
        data: softDeleteData(),
      });

      // Cascade soft delete to ProductionLines in this branch
      await tx.productionLine.updateMany({
        where: { branchId: id },
        data: softDeleteData(),
      });
    });

    return { success: true };
  }

  async getMachines(branchId: string): Promise<
    Prisma.MachineGetPayload<{
      include: {
        blueprint: true;
        fields: true;
      };
    }>[]
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
    tx: Prisma.TransactionClient,
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
