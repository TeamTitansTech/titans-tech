import { PrismaClient } from '@prisma/client';
import { UpdateServicePayload } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId, ServicePermission } from './permission-validator.js';

export interface UpdateServiceResult {
  isValid: boolean;
  error?: {
    code: 'NOT_FOUND' | 'FORBIDDEN';
    message: string;
  };
  service?: any;
}

/**
 * Updates a service after validating permissions and verifying it exists
 * Returns the updated service or an error
 */
export async function updateServiceWithValidation(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  permission: ServicePermission,
  updateDto: UpdateServicePayload,
): Promise<UpdateServiceResult> {
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
  // Verify service exists
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

  // Import the updateService function from service.ts
  const { updateService } = await import('./service.js');

  // Delegate update to existing shared service layer
  const updatedService = await updateService(prisma, serviceId, updateDto);

  return {
    isValid: true,
    service: updatedService,
    error: undefined,
  };
}
