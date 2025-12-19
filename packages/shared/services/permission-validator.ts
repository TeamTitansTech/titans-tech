import { PrismaClient } from '@prisma/client';

// TODO: Consider consolidating permission types with packages/shared/types/permissions.ts
// See issue for tracking: https://github.com/titans-tech/titans-tech/issues
// Currently ServicePermission is a subset of BranchPermissionType and could be unified

export interface PermissionValidationResult {
  isValid: boolean;
  error?: {
    code: 'NOT_FOUND' | 'FORBIDDEN';
    message: string;
  };
}

export type ServicePermission =
  | 'createServices'
  | 'updateServices'
  | 'deleteServices'
  | 'readServices';

/**
 * Validates if a user has permission to perform an action on a service
 * Returns validation result with error details if validation fails
 */
export async function validateServicePermission(
  prisma: PrismaClient,
  userId: string | null,
  machineId: string,
  permission: ServicePermission,
): Promise<PermissionValidationResult> {
  // SysAdmin has full access (userId is null when coming from SysAdmin)
  if (!userId) {
    return { isValid: true };
  }

  // 1. Get machine and its branch/company info
  const machine = await (prisma as any).machine.findUnique({
    where: { id: machineId },
    select: { branchId: true, branch: { select: { companyId: true } } },
  });

  if (!machine) {
    return {
      isValid: false,
      error: {
        code: 'NOT_FOUND',
        message: `Machine with ID ${machineId} not found`,
      },
    };
  }

  // 2. Get user info
  const user = await (prisma as any).user.findUnique({
    where: { id: userId },
    select: { companyId: true, isCompanyAdmin: true },
  });

  if (!user) {
    return {
      isValid: false,
      error: {
        code: 'FORBIDDEN',
        message: 'User not found',
      },
    };
  }

  // 3. Verify user belongs to the same company
  if (user.companyId !== machine.branch.companyId) {
    return {
      isValid: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied: User not part of this company',
      },
    };
  }

  // 4. Company Admin has full access
  if (user.isCompanyAdmin) {
    return { isValid: true };
  }

  // 5. Check branch-specific permission
  const userBranch = await (prisma as any).userBranch.findUnique({
    where: {
      userId_branchId: { userId, branchId: machine.branchId },
    },
  });

  if (!userBranch) {
    return {
      isValid: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Access denied: User not part of this branch',
      },
    };
  }

  if (!userBranch[permission]) {
    return {
      isValid: false,
      error: {
        code: 'FORBIDDEN',
        message: `Access denied: Missing required permission '${permission}'`,
      },
    };
  }

  return { isValid: true };
}

/**
 * Validates permission based on serviceId (fetches machineId internally)
 * Returns machineId if validation succeeds
 */
export async function validateServicePermissionByServiceId(
  prisma: PrismaClient,
  userId: string | null,
  serviceId: string,
  permission: ServicePermission,
): Promise<{
  isValid: boolean;
  machineId?: string;
  error?: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string };
}> {
  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
    select: { machineId: true },
  });

  if (!service) {
    return {
      isValid: false,
      error: {
        code: 'NOT_FOUND',
        message: `Service with ID ${serviceId} not found`,
      },
    };
  }

  const result = await validateServicePermission(prisma, userId, service.machineId, permission);

  if (!result.isValid) {
    return result;
  }

  return { isValid: true, machineId: service.machineId };
}

export type GetUserBranchIdsResult =
  | { error: { code: 'NOT_FOUND'; message: string } }
  | { branchIds: string[] };

/**
 * Gets all branch IDs that a user has a specific permission for
 * Company admins get all branches in their company
 * Regular users get only branches where they have the specified permission
 */
export async function getUserBranchIdsWithPermission(
  prisma: PrismaClient,
  userId: string,
  permission: ServicePermission,
): Promise<GetUserBranchIdsResult> {
  const user = await (prisma as any).user.findUnique({
    where: { id: userId },
    include: {
      branches: { where: { deletedAt: null } },
      company: {
        include: {
          branches: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!user) {
    return { error: { code: 'NOT_FOUND', message: 'User not found' } };
  }

  // Company admins get all branches in their company
  if (user.isCompanyAdmin) {
    return { branchIds: user.company.branches.map((b: { id: string }) => b.id) };
  }

  // Filter branches where user has the specified permission
  const permittedBranchIds = user.branches
    .filter((ub: any) => ub[permission])
    .map((ub: { branchId: string }) => ub.branchId);

  return { branchIds: permittedBranchIds };
}
