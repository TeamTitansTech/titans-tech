import { PrismaClient } from '@prisma/client';
import { ServiceRequestStatus } from '@titans-tech/db';
import { CreateServiceDto } from '@titans-tech/shared/backend-dtos';
import { validateServicePermission } from './permission-validator';
import { createService } from './service';

export type CreateServiceResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

/**
 * Creates a new service with permission validation and machine verification
 * If created from a service request, automatically closes the request
 * Returns the created service or an error
 */
export async function createServiceWithValidation(
  prisma: PrismaClient,
  createServiceDto: CreateServiceDto,
  userId: string | null,
): Promise<CreateServiceResult> {
  // Validate permission
  const permResult = await validateServicePermission(
    prisma,
    userId,
    createServiceDto.machineId,
    'createServices',
  );
  if (!permResult.isValid) {
    return { error: permResult.error! };
  }

  // Verify machine exists and get its blueprint
  const machine = await (prisma as any).machine.findUnique({
    where: { id: createServiceDto.machineId },
    include: { blueprint: true },
  });

  if (!machine) {
    return {
      error: {
        code: 'NOT_FOUND',
        message: `Machine with ID ${createServiceDto.machineId} not found`,
      },
    };
  }

  // Delegate creation to existing shared service layer
  const service = await createService(prisma, createServiceDto);

  // If this service was created from a service request, close the request
  if (createServiceDto.serviceRequestId) {
    await (prisma as any).serviceRequest.update({
      where: { id: createServiceDto.serviceRequestId },
      data: {
        status: ServiceRequestStatus.CLOSED,
        closedAt: new Date(),
      },
    });
  }

  return { service };
}
