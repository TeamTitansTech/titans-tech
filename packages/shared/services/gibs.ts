import { PrismaClient } from '@prisma/client';
import { GibsCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdateGibsResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updateGibs(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: GibsCheck,
): Promise<UpdateGibsResult> {
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
    include: { gibs: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('GIBS')
    ? completedSections
    : [...completedSections, 'GIBS'];

  // 4. Upsert using existing function
  const existingRecord = service.gibs?.[0];
  await upsertGibs(
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

export async function upsertGibs(
  prisma: PrismaClient,
  serviceId: string,
  updateDto: GibsCheck,
  existingRecord: any,
  updatedCompletedSections: string[],
) {
  const upsertGibsStage = async (
    tx: any,
    stageData: any,
    existingId: string | null | undefined,
    updatePayload: Record<string, any>,
    fieldName: string,
  ) => {
    if (!stageData) return;

    if (existingId) {
      await (tx as any).gibsStageData.update({
        where: { id: existingId },
        data: stageData,
      });
    } else {
      const created = await (tx as any).gibsStageData.create({
        data: stageData,
      });
      updatePayload[fieldName] = created.id;
    }
  };

  if (existingRecord) {
    await (prisma as any).$transaction(async (tx: any) => {
      const updatePayload: Record<string, any> = {};

      await upsertGibsStage(
        tx,
        updateDto.outerBefore,
        existingRecord.outerBeforeId,
        updatePayload,
        'outerBeforeId',
      );

      await upsertGibsStage(
        tx,
        updateDto.outerData,
        existingRecord.outerDataId,
        updatePayload,
        'outerDataId',
      );

      await upsertGibsStage(
        tx,
        updateDto.outerFreeHangingData,
        existingRecord.outerFreeHangingDataId,
        updatePayload,
        'outerFreeHangingDataId',
      );

      await upsertGibsStage(
        tx,
        updateDto.innerBefore,
        existingRecord.innerBeforeId,
        updatePayload,
        'innerBeforeId',
      );

      await upsertGibsStage(
        tx,
        updateDto.innerData,
        existingRecord.innerDataId,
        updatePayload,
        'innerDataId',
      );

      await upsertGibsStage(
        tx,
        updateDto.innerBeforeTool,
        existingRecord.innerBeforeToolId,
        updatePayload,
        'innerBeforeToolId',
      );

      await upsertGibsStage(
        tx,
        updateDto.innerDataTool,
        existingRecord.innerDataToolId,
        updatePayload,
        'innerDataToolId',
      );

      if (updateDto.haveInnerGibsBeenAdjusted !== undefined) {
        updatePayload.haveInnerGibsBeenAdjusted = updateDto.haveInnerGibsBeenAdjusted;
      }

      if (updateDto.notes !== undefined) {
        updatePayload.notes = updateDto.notes;
      }

      if (Object.keys(updatePayload).length > 0) {
        await (tx as any).machineServiceGibs.update({
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
        gibs: {
          create: {
            ...(updateDto.outerBefore && {
              outerBefore: {
                create: updateDto.outerBefore,
              },
            }),
            ...(updateDto.outerData && {
              outerData: {
                create: updateDto.outerData,
              },
            }),
            ...(updateDto.outerFreeHangingData && {
              outerFreeHangingData: {
                create: updateDto.outerFreeHangingData,
              },
            }),
            ...(updateDto.haveInnerGibsBeenAdjusted && {
              haveInnerGibsBeenAdjusted: updateDto.haveInnerGibsBeenAdjusted,
            }),
            ...(updateDto.innerBefore && {
              innerBefore: {
                create: updateDto.innerBefore,
              },
            }),
            ...(updateDto.innerData && {
              innerData: {
                create: updateDto.innerData,
              },
            }),
            ...(updateDto.innerBeforeTool && {
              innerBeforeTool: {
                create: updateDto.innerBeforeTool,
              },
            }),
            ...(updateDto.innerDataTool && {
              innerDataTool: {
                create: updateDto.innerDataTool,
              },
            }),
            ...(updateDto.notes && { notes: updateDto.notes }),
          },
        },
      },
    });
  }
}
