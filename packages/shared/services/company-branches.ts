import { PrismaClient } from '@titans-tech/db';
import { machinesService } from './machines';

type TransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

export const companyBranchesService = {
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
