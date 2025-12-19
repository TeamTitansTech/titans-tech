import { PrismaClient } from '@prisma/client';
import { DieCushionCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdateDieCushionResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updateDieCushion(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: DieCushionCheck,
): Promise<UpdateDieCushionResult> {
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
    include: { dieCushion: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('DIE_CUSHION')
    ? completedSections
    : [...completedSections, 'DIE_CUSHION'];

  // 4. Upsert logic
  const existingRecord = service.dieCushion?.[0];

  if (existingRecord) {
    await (prisma as any).$transaction(async (tx: any) => {
      await tx.machineServiceDieCushion.update({
        where: { id: existingRecord.id },
        data: {
          airLeaks: updateDto.airLeaks,
          airLeaksLocation: updateDto.airLeaksLocation,
          pneumaticsPlumbing: updateDto.pneumaticsPlumbing,
          lubrication: updateDto.lubrication,
          notes: updateDto.notes,
        },
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
        dieCushion: {
          create: {
            airLeaks: updateDto.airLeaks,
            airLeaksLocation: updateDto.airLeaksLocation,
            pneumaticsPlumbing: updateDto.pneumaticsPlumbing,
            lubrication: updateDto.lubrication,
            notes: updateDto.notes,
          },
        },
      },
    });
  }

  // 5. Return updated service
  const updatedService = await findServiceById(prisma, serviceId);
  return { service: updatedService };
}
