import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

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

@Injectable()
export class CompanyLimitsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if company can create a new branch
   */
  async checkBranchLimit(companyId: string): Promise<CompanyLimitCheck> {
    const company = await this.getCompanyWithCounts(companyId);
    const currentCount = company._count.branches;
    const maxAllowed = company.contractMaxBranches;

    return {
      isAllowed: currentCount < maxAllowed,
      currentCount,
      maxAllowed,
      resourceType: 'branches',
    };
  }

  /**
   * Check if company can create a new user
   */
  async checkUserLimit(companyId: string): Promise<CompanyLimitCheck> {
    const company = await this.getCompanyWithCounts(companyId);
    const currentCount = company._count.users;
    const maxAllowed = company.contractMaxUsers;

    return {
      isAllowed: currentCount < maxAllowed,
      currentCount,
      maxAllowed,
      resourceType: 'users',
    };
  }

  /**
   * Check if company can create a new machine
   */
  async checkMachineLimit(companyId: string): Promise<CompanyLimitCheck> {
    const company = await this.getCompanyWithCounts(companyId);
    // Count machines across all branches of the company
    const currentCount = await this.prisma.machine.count({
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
  }

  /**
   * Check if company can create a new production line
   */
  async checkProductionLineLimit(
    companyId: string,
  ): Promise<CompanyLimitCheck> {
    const company = await this.getCompanyWithCounts(companyId);
    // Count production lines across all branches of the company
    const currentCount = await this.prisma.productionLine.count({
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
  }

  /**
   * Enforce branch creation limit - throws exception if limit exceeded
   */
  async enforceBranchLimit(companyId: string): Promise<void> {
    const check = await this.checkBranchLimit(companyId);
    if (!check.isAllowed) {
      throw new BadRequestException(
        `Your company has reached the maximum number of ${check.resourceType} (${check.maxAllowed}). Contact support to upgrade your plan.`,
      );
    }
  }

  /**
   * Enforce user creation limit - throws exception if limit exceeded
   */
  async enforceUserLimit(companyId: string): Promise<void> {
    const check = await this.checkUserLimit(companyId);
    if (!check.isAllowed) {
      throw new BadRequestException(
        `Your company has reached the maximum number of ${check.resourceType} (${check.maxAllowed}). Contact support to upgrade your plan.`,
      );
    }
  }

  /**
   * Enforce machine creation limit - throws exception if limit exceeded
   */
  async enforceMachineLimit(companyId: string): Promise<void> {
    const check = await this.checkMachineLimit(companyId);
    if (!check.isAllowed) {
      throw new BadRequestException(
        `Your company has reached the maximum number of ${check.resourceType} (${check.maxAllowed}). Contact support to upgrade your plan.`,
      );
    }
  }

  /**
   * Enforce production line creation limit - throws exception if limit exceeded
   */
  async enforceProductionLineLimit(companyId: string): Promise<void> {
    const check = await this.checkProductionLineLimit(companyId);
    if (!check.isAllowed) {
      throw new BadRequestException(
        `Your company has reached the maximum number of ${check.resourceType} (${check.maxAllowed}). Contact support to upgrade your plan.`,
      );
    }
  }

  /**
   * Get complete usage statistics for a company
   */
  async getCompanyUsageStats(companyId: string): Promise<CompanyUsageStats> {
    const [branchCheck, userCheck, machineCheck, productionLineCheck] =
      await Promise.all([
        this.checkBranchLimit(companyId),
        this.checkUserLimit(companyId),
        this.checkMachineLimit(companyId),
        this.checkProductionLineLimit(companyId),
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
  }

  /**
   * Helper method to get company with essential counts
   */
  private async getCompanyWithCounts(companyId: string) {
    const company = await this.prisma.company.findUnique({
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

    if (!company) {
      throw new BadRequestException(`Company with ID ${companyId} not found`);
    }

    return company;
  }
}
