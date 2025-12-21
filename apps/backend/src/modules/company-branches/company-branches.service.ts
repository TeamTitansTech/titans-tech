import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { MachinesService } from '../machines/machines.service';
import { CompanyLimitsService } from '../shared/company-limits.service';
import {
  CreateCompanyBranchDto,
  UpdateCompanyBranchDto,
  SetUserPermissionsDto,
  UserResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { Prisma } from '@titans-tech/db';

@Injectable()
export class CompanyBranchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly machinesService: MachinesService,
    private readonly companyLimitsService: CompanyLimitsService,
  ) {}

  /**
   * Get all branches across all companies (SysAdmin only)
   */
  async findAll() {
    return this.prisma.companyBranch.findMany({
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
      where: { companyId },
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
    await this.companyLimitsService.enforceBranchLimit(companyId);

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

  /**
   * Soft delete cascade for company branch and all related entities
   * Handles: Machines → ProductionLines → UserBranches → CompanyBranch
   * Public method to allow reuse by CompaniesService
   */
  async softDeleteCompanyBranchCascade(
    tx: Prisma.TransactionClient,
    branchId: string,
  ): Promise<void> {
    // 1. Get all machines in this branch
    const machines = await tx.machine.findMany({
      where: { branchId },
      select: { id: true },
    });

    // 2. Soft delete all machines using the MachinesService cascade method
    for (const machine of machines) {
      await this.machinesService.softDeleteMachineCascade(tx, machine.id);
    }

    // 3. Soft delete all ProductionLines
    await tx.productionLine.deleteMany({
      where: { branchId },
    });

    // 4. Soft delete all UserBranches
    await tx.userBranch.deleteMany({
      where: { branchId },
    });

    // 5. Finally, soft delete the CompanyBranch itself
    await tx.companyBranch.delete({
      where: { id: branchId },
    });
  }

  async remove(id: string) {
    const branch = await this.prisma.companyBranch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Prevent deletion of main branch
    if (branch.isMainBranch) {
      throw new BadRequestException('Cannot delete the main branch');
    }

    // Use transaction to ensure atomic cascade deletion
    await this.prisma.$transaction(async (tx) => {
      await this.softDeleteCompanyBranchCascade(tx, id);
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
          where: { deletedAt: null },
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
