import { PrismaClient } from '@prisma/client';
import { validateServicePermissionByServiceId, ServicePermission } from './permission-validator.js';

export interface DeleteServiceResult {
  isValid: boolean;
  error?: {
    code: 'NOT_FOUND' | 'FORBIDDEN';
    message: string;
  };
}

/**
 * Deletes a service after validating permissions and verifying it exists
 * Returns success or an error
 */
export async function deleteServiceWithValidation(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  permission: ServicePermission,
): Promise<DeleteServiceResult> {
  // Validate permissions first
  const permissionResult = await validateServicePermissionByServiceId(
    prisma,
    userId,
    serviceId,
    permission,
  );

  if (!permissionResult.isValid) {
    return permissionResult;
  }
  // Verify service exists and get machineId for permission check
  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
    select: { id: true, machineId: true },
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

  // Import the deleteService function from service.ts
  const { deleteService } = await import('./service.js');

  // Delete the service (cascade delete will handle related data)
  await deleteService(prisma, serviceId);

  return {
    isValid: true,
  };
}
