import { PrismaClient } from '@prisma/client';
import { PerpendicularityCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdatePerpendicularityResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

/**
 * Convert string values to Decimal for Prisma
 */
function toDecimal(value: number | string | undefined): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return typeof value === 'string' ? parseFloat(value) : value;
}

export async function updatePerpendicularity(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: PerpendicularityCheck,
): Promise<UpdatePerpendicularityResult> {
  // 1. Validate permissions
  const permResult = await validateServicePermissionByServiceId(
    prisma,
    userId,
    serviceId,
    'updateServices',
  );
  if (!permResult.isValid) {
    return { error: permResult.error! };
  }

  // 2. Fetch service with section
  const service = await (prisma as any).machineService.findUnique({
    where: { id: serviceId },
    include: { perpendicularity: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('PERPENDICULARITY')
    ? completedSections
    : [...completedSections, 'PERPENDICULARITY'];

  // 4. Upsert logic
  const existingRecord = service.perpendicularity?.[0];

  const data = {
    hasBeenAdjusted: updateDto.hasBeenAdjusted,
    beforeFR: toDecimal(updateDto.beforeFR),
    beforeLR: toDecimal(updateDto.beforeLR),
    afterFR: toDecimal(updateDto.afterFR),
    afterLR: toDecimal(updateDto.afterLR),
    notes: updateDto.notes,
  };

  if (existingRecord) {
    await (prisma as any).$transaction(async (tx: any) => {
      await tx.machineServicePerpendicularity.update({
        where: { id: existingRecord.id },
        data,
      });

      await tx.machineService.update({
        where: { id: serviceId },
        data: {
          completedSections: updatedCompletedSections,
          lastSectionSavedAt: new Date(),
        },
      });
    });
  } else {
    await (prisma as any).machineService.update({
      where: { id: serviceId },
      data: {
        completedSections: updatedCompletedSections,
        lastSectionSavedAt: new Date(),
        perpendicularity: {
          create: data,
        },
      },
    });
  }

  // 5. Return updated service
  const updatedService = await findServiceById(prisma, serviceId);
  return { service: updatedService };
}
