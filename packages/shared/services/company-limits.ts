import { PrismaClient } from '@titans-tech/db';
import { UpdateCompanyLimitsDto } from '@titans-tech/shared/backend-dtos';

export interface CompanyLimitCheck {
  isAllowed: boolean;
  currentCount: number;
  maxAllowed: number;
  resourceType: 'branches' | 'users' | 'machines' | 'production lines';
}

export interface CompanyUsageStats {
  branches: { current: number; max: number };
  users: { current: number; max: number };
  machines: { current: number; max: number };
  productionLines: { current: number; max: number };
}

export const companyLimitsService = {
  /**
   * Check if company can create a new branch
   */
  async checkBranchLimit(prisma: PrismaClient, companyId: string): Promise<CompanyLimitCheck> {
    const company = await companyLimitsService.getCompanyWithCounts(prisma, companyId);
    if (!company) {
      throw { type: 'VALIDATION_ERR', message: `Company with ID ${companyId} not found` };
    }

    const currentCount = company._count.branches;
    const maxAllowed = company.contractMaxBranches;

    return {
      isAllowed: currentCount < maxAllowed,
      currentCount,
      maxAllowed,
      resourceType: 'branches',
    };
  },

  /**
   * Check if company can create a new user
   */
  async checkUserLimit(prisma: PrismaClient, companyId: string): Promise<CompanyLimitCheck> {
    const company = await companyLimitsService.getCompanyWithCounts(prisma, companyId);
    if (!company) {
      throw { type: 'VALIDATION_ERR', message: `Company with ID ${companyId} not found` };
    }

    const currentCount = company._count.users;
    const maxAllowed = company.contractMaxUsers;

    return {
      isAllowed: currentCount < maxAllowed,
      currentCount,
      maxAllowed,
      resourceType: 'users',
    };
  },

  /**
   * Check if company can create a new machine
   */
  async checkMachineLimit(prisma: PrismaClient, companyId: string): Promise<CompanyLimitCheck> {
    const company = await companyLimitsService.getCompanyWithCounts(prisma, companyId);
    if (!company) {
      throw { type: 'VALIDATION_ERR', message: `Company with ID ${companyId} not found` };
    }

    // Count machines across all branches of the company
    const currentCount = await prisma.machine.count({
      where: {
        branch: {
          companyId,
        },
      },
    });
    const maxAllowed = company.contractMaxMachines;

    return {
      isAllowed: currentCount < maxAllowed,
      currentCount,
      maxAllowed,
      resourceType: 'machines',
    };
  },

  /**
   * Check if company can create a new production line
   */
  async checkProductionLineLimit(
    prisma: PrismaClient,
    companyId: string,
  ): Promise<CompanyLimitCheck> {
    const company = await companyLimitsService.getCompanyWithCounts(prisma, companyId);
    if (!company) {
      throw { type: 'VALIDATION_ERR', message: `Company with ID ${companyId} not found` };
    }

    // Count production lines across all branches of the company
    const currentCount = await prisma.productionLine.count({
      where: {
        branch: {
          companyId,
        },
      },
    });
    const maxAllowed = company.contractMaxProductionLines;

    return {
      isAllowed: currentCount < maxAllowed,
      currentCount,
      maxAllowed,
      resourceType: 'production lines',
    };
  },

  /**
   * Get complete usage statistics for a company
   */
  async getCompanyUsageStats(prisma: PrismaClient, companyId: string): Promise<CompanyUsageStats> {
    const [branchCheck, userCheck, machineCheck, productionLineCheck] = await Promise.all([
      companyLimitsService.checkBranchLimit(prisma, companyId),
      companyLimitsService.checkUserLimit(prisma, companyId),
      companyLimitsService.checkMachineLimit(prisma, companyId),
      companyLimitsService.checkProductionLineLimit(prisma, companyId),
    ]);

    return {
      branches: {
        current: branchCheck.currentCount,
        max: branchCheck.maxAllowed,
      },
      users: {
        current: userCheck.currentCount,
        max: userCheck.maxAllowed,
      },
      machines: {
        current: machineCheck.currentCount,
        max: machineCheck.maxAllowed,
      },
      productionLines: {
        current: productionLineCheck.currentCount,
        max: productionLineCheck.maxAllowed,
      },
    };
  },

  /**
   * Update company contract limits (SysAdmin only)
   */
  async updateCompanyLimits(
    prisma: PrismaClient,
    companyId: string,
    updateLimitsDto: UpdateCompanyLimitsDto,
  ) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw { type: 'VALIDATION_ERR', message: 'Company not found' };
    }

    return prisma.company.update({
      where: { id: companyId },
      data: updateLimitsDto,
    });
  },

  /**
   * Helper method to get company with essential counts
   */
  async getCompanyWithCounts(prisma: PrismaClient, companyId: string) {
    return prisma.company.findUnique({
      where: { id: companyId },
      select: {
        contractMaxBranches: true,
        contractMaxUsers: true,
        contractMaxMachines: true,
        contractMaxProductionLines: true,
        _count: {
          select: {
            branches: true,
            users: true,
          },
        },
      },
    });
  },
};

export default companyLimitsService;
