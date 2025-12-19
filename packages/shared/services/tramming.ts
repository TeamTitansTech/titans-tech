import { PrismaClient } from '@prisma/client';
import { TrammingCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdateTrammingResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updateTramming(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: TrammingCheck,
): Promise<UpdateTrammingResult> {
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
    include: { tramming: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('TRAMMING')
    ? completedSections
    : [...completedSections, 'TRAMMING'];

  // 4. Upsert using existing function
  const existingRecord = service.tramming?.[0];
  await upsertTramming(
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

export async function upsertTramming(
  prisma: PrismaClient,
  serviceId: string,
  updateDto: TrammingCheck,
  existingRecord: any,
  updatedCompletedSections: string[],
) {
  const outerPrismaData = updateDto.outerData || null;
  const innerPrismaData = updateDto.innerData || null;

  if (existingRecord) {
    await (prisma as any).$transaction(async (tx: any) => {
      const updatePayload: any = {};

      if (outerPrismaData) {
        if (existingRecord.outerDataId) {
          await (tx as any).trammingData.update({
            where: { id: existingRecord.outerDataId },
            data: outerPrismaData as any,
          });
        } else {
          const created = await (tx as any).trammingData.create({
            data: outerPrismaData as any,
          });
          updatePayload.outerDataId = created.id;
        }
      }

      if (innerPrismaData) {
        if (existingRecord.innerDataId) {
          await (tx as any).trammingData.update({
            where: { id: existingRecord.innerDataId },
            data: innerPrismaData as any,
          });
        } else {
          const created = await (tx as any).trammingData.create({
            data: innerPrismaData as any,
          });
          updatePayload.innerDataId = created.id;
        }
      }

      if (updateDto.slideTram !== undefined) {
        updatePayload.slideTram = updateDto.slideTram;
      }
      if (updateDto.notes !== undefined) {
        updatePayload.notes = updateDto.notes;
      }

      if (Object.keys(updatePayload).length > 0) {
        await (tx as any).machineServiceTramming.update({
          where: { id: existingRecord.id },
          data: updatePayload,
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
        tramming: {
          create: {
            ...(outerPrismaData && {
              outerData: { create: outerPrismaData as any },
            }),
            ...(innerPrismaData && {
              innerData: { create: innerPrismaData as any },
            }),
            ...(updateDto.slideTram && { slideTram: updateDto.slideTram }),
            ...(updateDto.notes && { notes: updateDto.notes }),
          } as any,
        },
      },
    });
  }
}
