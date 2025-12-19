import { PrismaClient } from '@prisma/client';
import { getUserBranchIdsWithPermission } from './permission-validator';

export interface FindServicesByMachineResult {
  isValid: boolean;
  services?: any[];
  error?: {
    code: 'NOT_FOUND';
    message: string;
  };
}

export type FindAllServicesForUserResult =
  | { error: { code: 'NOT_FOUND'; message: string } }
  | { services: any[] };

/**
 * Finds all services for branches that the user has readServices permission for
 */
export async function findAllServicesForUser(
  prisma: PrismaClient,
  userId: string,
): Promise<FindAllServicesForUserResult> {
  const branchResult = await getUserBranchIdsWithPermission(prisma, userId, 'readServices');

  if ('error' in branchResult) {
    return branchResult;
  }

  const services = await (prisma as any).machineService.findMany({
    where: {
      machine: { branchId: { in: branchResult.branchIds } },
    },
    include: {
      machine: { include: { blueprint: true, fields: true, branch: true } },
    },
    orderBy: { date: 'desc' },
  });

  return { services };
}

/**
 * Finds all services for a machine after verifying the machine exists
 */
export async function findServicesByMachineWithValidation(
  prisma: PrismaClient,
  machineId: string,
): Promise<FindServicesByMachineResult> {
  // Verify machine exists
  const machine = await (prisma as any).machine.findUnique({
    where: { id: machineId },
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

  // Import the findServicesByMachine function from service.ts
  const { findServicesByMachine } = await import('./service.js');

  const services = await findServicesByMachine(prisma, machineId);

  return {
    isValid: true,
    services,
  };
}
