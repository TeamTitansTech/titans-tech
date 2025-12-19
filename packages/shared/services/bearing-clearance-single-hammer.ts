import { PrismaClient } from '@prisma/client';
import { BearingClearanceSingleHammerCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdateBearingClearanceSingleHammerResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updateBearingClearanceSingleHammer(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: BearingClearanceSingleHammerCheck,
): Promise<UpdateBearingClearanceSingleHammerResult> {
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
    include: { bearingClearanceSingleHammer: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('BEARING_CLEARANCE_SINGLE_HAMMER')
    ? completedSections
    : [...completedSections, 'BEARING_CLEARANCE_SINGLE_HAMMER'];

  // 4. Upsert logic
  const existingRecord = service.bearingClearanceSingleHammer?.[0];

  await (prisma as any).$transaction(async (tx: any) => {
    // Helper function to upsert nested bearing clearance data
    const upsertData = async (data: any, existingId: string | null | undefined) => {
      if (!data) return existingId;

      if (existingId) {
        await tx.bearingClearanceData.update({
          where: { id: existingId },
          data: data,
        });
        return existingId;
      } else {
        const created = await tx.bearingClearanceData.create({
          data: data,
        });
        return created.id;
      }
    };

    if (existingRecord) {
      const beforeDataId = await upsertData(updateDto.beforeData, existingRecord.beforeDataId);
      const dataId = await upsertData(updateDto.data, existingRecord.dataId);

      await tx.machineServiceBearingClearanceSingleHammer.update({
        where: { id: existingRecord.id },
        data: {
          ...(beforeDataId && { beforeDataId }),
          ...(dataId && { dataId }),
        },
      });
    } else {
      await tx.machineServiceBearingClearanceSingleHammer.create({
        data: {
          machineService: { connect: { id: serviceId } },
          ...(updateDto.beforeData && {
            beforeData: { create: updateDto.beforeData },
          }),
          ...(updateDto.data && {
            data: { create: updateDto.data },
          }),
        },
      });
    }

    await tx.machineService.update({
      where: { id: serviceId },
      data: {
        completedSections: updatedCompletedSections,
        lastSectionSavedAt: new Date(),
      },
    });
  });

  // 5. Return updated service
  const updatedService = await findServiceById(prisma, serviceId);
  return { service: updatedService };
}
