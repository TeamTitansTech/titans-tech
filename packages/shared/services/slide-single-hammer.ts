import { PrismaClient } from '@prisma/client';
import { SlideSingleHammerCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdateSlideSingleHammerResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updateSlideSingleHammer(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: SlideSingleHammerCheck,
): Promise<UpdateSlideSingleHammerResult> {
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
    include: { slideSingleHammer: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('SLIDE_SINGLE_HAMMER')
    ? completedSections
    : [...completedSections, 'SLIDE_SINGLE_HAMMER'];

  // 4. Upsert using existing function
  const existingRecord = service.slideSingleHammer?.[0];
  await upsertSlideSingleHammer(
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

export async function upsertSlideSingleHammer(
  prisma: PrismaClient,
  serviceId: string,
  updateDto: SlideSingleHammerCheck,
  existingRecord: any,
  updatedCompletedSections: string[],
) {
  await (prisma as any).$transaction(async (tx: any) => {
    const upsertData = async (data: any, existingId: string | null | undefined) => {
      if (!data) return existingId;

      if (existingId) {
        await (tx as any).slideSingleHammerData.update({
          where: { id: existingId },
          data: data as any,
        });
        return existingId;
      }

      const created = await (tx as any).slideSingleHammerData.create({
        data: data as any,
      });
      return created.id;
    };

    if (existingRecord) {
      const beforeDataId = await upsertData(updateDto.beforeData, existingRecord.beforeDataId);
      const dataId = await upsertData(updateDto.data, existingRecord.dataId);

      const updatePayload: any = {
        ...(beforeDataId && { beforeDataId }),
        ...(dataId && { dataId }),
        ...(updateDto.notes !== undefined && { notes: updateDto.notes }),
      };

      await (tx as any).machineServiceSlideSingleHammer.update({
        where: { id: existingRecord.id },
        data: updatePayload,
      });
    } else {
      const { beforeData, data, notes } = updateDto;

      await (tx as any).machineServiceSlideSingleHammer.create({
        data: {
          machineService: { connect: { id: serviceId } },
          ...(beforeData && { beforeData: { create: beforeData as any } }),
          ...(data && { data: { create: data as any } }),
          ...(notes && { notes }),
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
}
