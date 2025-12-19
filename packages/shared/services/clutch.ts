import { PrismaClient } from '@prisma/client';
import { ClutchData } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdateClutchResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updateClutch(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: ClutchData,
): Promise<UpdateClutchResult> {
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
    include: { clutch: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('CLUTCH')
    ? completedSections
    : [...completedSections, 'CLUTCH'];

  // 4. Upsert using existing function
  const existingRecord = service.clutch?.[0];
  await upsertClutch(
    prisma,
    serviceId,
    updateDto,
    existingRecord,
    updatedCompletedSections as string[],
  );

  // 5. Return updated service
  const updatedService = await findServiceById(prisma, serviceId);
  return { service: updatedService };
}

export async function upsertClutch(
  prisma: PrismaClient,
  serviceId: string,
  updateDto: ClutchData,
  existingRecord: any,
  updatedCompletedSections: string[],
) {
  if (existingRecord) {
    await (prisma as any).$transaction(async (tx: any) => {
      if (existingRecord.dataId) {
        await (tx as any).clutchData.update({
          where: { id: existingRecord.dataId },
          data: updateDto as any,
        });
      } else {
        await (tx as any).machineServiceClutch.update({
          where: { id: existingRecord.id },
          data: {
            data: { create: updateDto as any },
          },
        });
      }

      await (tx as any).machineService.update({
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
        clutch: {
          create: {
            data: { create: updateDto as any },
          },
        },
      },
    });
  }
}
