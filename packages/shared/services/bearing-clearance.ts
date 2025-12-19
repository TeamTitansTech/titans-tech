import { PrismaClient } from '@prisma/client';
import { BearingClearanceCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdateBearingClearanceResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updateBearingClearance(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: BearingClearanceCheck,
): Promise<UpdateBearingClearanceResult> {
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
    include: { bearingClearance: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('BEARING_CLEARANCE')
    ? completedSections
    : [...completedSections, 'BEARING_CLEARANCE'];

  // 4. Upsert using existing function
  const existingRecord = service.bearingClearance?.[0];
  await upsertBearingClearance(
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

export async function upsertBearingClearance(
  prisma: PrismaClient,
  serviceId: string,
  updateDto: BearingClearanceCheck,
  existingRecord: any,
  updatedCompletedSections: string[],
) {
  const upsertData = async (data: any, existingId: string | null | undefined) => {
    if (!data) return existingId;

    if (existingId) {
      const updated = await (prisma as any).bearingClearanceData.update({
        where: { id: existingId },
        data,
      });
      return updated.id;
    }

    const created = await (prisma as any).bearingClearanceData.create({
      data,
    });
    return created.id;
  };

  await (prisma as any).$transaction(async (tx: any) => {
    const txClient = tx as PrismaClient;
    const upsertWithTx = async (data: any, existingId: string | null | undefined) => {
      if (!data) return existingId;
      if (existingId) {
        const updated = await (txClient as any).bearingClearanceData.update({
          where: { id: existingId },
          data,
        });
        return updated.id;
      }
      const created = await (txClient as any).bearingClearanceData.create({
        data,
      });
      return created.id;
    };

    if (existingRecord) {
      const outerBeforeId = await upsertWithTx(updateDto.outerBefore, existingRecord.outerBeforeId);
      const outerDataId = await upsertWithTx(updateDto.outerData, existingRecord.outerDataId);
      const innerBeforeId = await upsertWithTx(updateDto.innerBefore, existingRecord.innerBeforeId);
      const innerDataId = await upsertWithTx(updateDto.innerData, existingRecord.innerDataId);

      const updatePayload: any = {
        ...(outerBeforeId && { outerBeforeId }),
        ...(outerDataId && { outerDataId }),
        ...(innerBeforeId && { innerBeforeId }),
        ...(innerDataId && { innerDataId }),
      };

      await (txClient as any).machineServiceBearingClearance.update({
        where: { id: existingRecord.id },
        data: updatePayload,
      });
    } else {
      const { outerBefore, outerData, innerBefore, innerData } = updateDto;

      await (txClient as any).machineService.update({
        where: { id: serviceId },
        data: {
          bearingClearance: {
            create: {
              ...(outerBefore && { outerBefore: { create: outerBefore as any } }),
              ...(outerData && { outerData: { create: outerData as any } }),
              ...(innerBefore && { innerBefore: { create: innerBefore as any } }),
              ...(innerData && { innerData: { create: innerData as any } }),
            },
          },
        },
      });
    }

    await (txClient as any).machineService.update({
      where: { id: serviceId },
      data: {
        completedSections: updatedCompletedSections,
        lastSectionSavedAt: new Date(),
      },
    });
  });
}
