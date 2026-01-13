import { PrismaClient } from '@titans-tech/db';
import { machinesService } from './machines';

type TransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export const companyBranchesService = {
  /**
   * Get all branches for a company (Admin/SysAdmin only)
   */
  async findAllByCompany(prisma: PrismaClient, companyId: string) {
    return prisma.companyBranch.findMany({
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
  },

  /**
   * Get branches for a company filtered by user permissions
   * Only returns branches where the user has readBranches permission
   */
  async findAllByCompanyFilteredByPermissions(
    prisma: PrismaClient,
    companyId: string,
    userId: string,
  ) {
    const result = await prisma.companyBranch.findMany({
      where: {
        companyId,
        users: {
          some: {
            deletedAt: null,
            userId,
            readBranches: {
              equals: true,
            },
          },
        },
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
    return result;
  },

  /**
   * Soft delete cascade for company branch and all related entities
   * Handles: Machines -> ProductionLines -> UserBranches -> CompanyBranch
   */
  async softDeleteCascade(tx: TransactionClient, branchId: string): Promise<void> {
    // 1. Get all machines in this branch
    const machines = await tx.machine.findMany({
      where: { branchId },
      select: { id: true },
    });

    // 2. Soft delete all machines using the machines cascade method
    for (const machine of machines) {
      await machinesService.softDeleteCascade(tx, machine.id);
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
  },
};

export default companyBranchesService;
