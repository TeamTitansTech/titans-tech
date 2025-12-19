import { PrismaClient } from '@prisma/client';
import { SlideDoubleHammerCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdateSlideDoubleHammerResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updateSlideDoubleHammer(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: SlideDoubleHammerCheck,
): Promise<UpdateSlideDoubleHammerResult> {
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
    include: { slideDoubleHammer: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('SLIDE_DOUBLE_HAMMER')
    ? completedSections
    : [...completedSections, 'SLIDE_DOUBLE_HAMMER'];

  // 4. Upsert using existing function
  const existingRecord = service.slideDoubleHammer?.[0];
  await upsertSlideDoubleHammer(
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

export async function upsertSlideDoubleHammer(
  prisma: PrismaClient,
  serviceId: string,
  updateDto: SlideDoubleHammerCheck,
  existingRecord: any,
  updatedCompletedSections: string[],
) {
  await (prisma as any).$transaction(async (tx: any) => {
    const upsertData = async (data: any, existingId: string | null | undefined) => {
      if (!data) return existingId;

      if (existingId) {
        await (tx as any).slideDoubleHammerData.update({
          where: { id: existingId },
          data: data as any,
        });
        return existingId;
      }

      const created = await (tx as any).slideDoubleHammerData.create({
        data: data as any,
      });
      return created.id;
    };

    if (existingRecord) {
      const outerBeforeId = await upsertData(updateDto.outerBefore, existingRecord.outerBeforeId);
      const outerDataId = await upsertData(updateDto.outerData, existingRecord.outerDataId);
      const innerBeforeId = await upsertData(updateDto.innerBefore, existingRecord.innerBeforeId);
      const innerDataId = await upsertData(updateDto.innerData, existingRecord.innerDataId);

      const updatePayload: any = {
        ...(outerBeforeId && { outerBeforeId }),
        ...(outerDataId && { outerDataId }),
        ...(innerBeforeId && { innerBeforeId }),
        ...(innerDataId && { innerDataId }),
        ...(updateDto.notes !== undefined && { notes: updateDto.notes }),
      };

      await (tx as any).machineServiceSlideDoubleHammer.update({
        where: { id: existingRecord.id },
        data: updatePayload,
      });
    } else {
      const { outerBefore, outerData, innerBefore, innerData, notes } = updateDto;

      await (tx as any).machineServiceSlideDoubleHammer.create({
        data: {
          machineService: { connect: { id: serviceId } },
          ...(outerBefore && { outerBefore: { create: outerBefore as any } }),
          ...(outerData && { outerData: { create: outerData as any } }),
          ...(innerBefore && { innerBefore: { create: innerBefore as any } }),
          ...(innerData && { innerData: { create: innerData as any } }),
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
