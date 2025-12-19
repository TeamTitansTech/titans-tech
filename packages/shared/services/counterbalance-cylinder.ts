import { PrismaClient } from '@prisma/client';
import { CounterbalanceCylinderCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdateCounterbalanceCylinderResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updateCounterbalanceCylinder(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: CounterbalanceCylinderCheck,
): Promise<UpdateCounterbalanceCylinderResult> {
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
    include: { counterbalanceCylinderAirbag: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('COUNTERBALANCE_CYLINDER_AIRBAG')
    ? completedSections
    : [...completedSections, 'COUNTERBALANCE_CYLINDER_AIRBAG'];

  // 4. Upsert using existing function
  const existingRecord = service.counterbalanceCylinderAirbag?.[0];
  await upsertCounterbalanceCylinder(
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

export async function upsertCounterbalanceCylinder(
  prisma: PrismaClient,
  serviceId: string,
  updateDto: CounterbalanceCylinderCheck,
  existingRecord: any,
  updatedCompletedSections: string[],
) {
  if (existingRecord) {
    await (prisma as any).$transaction(async (tx: any) => {
      const updatePayload: any = {};

      if (updateDto.outerData) {
        if (existingRecord.outerDataId) {
          await (tx as any).counterbalanceCylinderAirbagData.update({
            where: { id: existingRecord.outerDataId },
            data: updateDto.outerData as any,
          });
        } else {
          const created = await (tx as any).counterbalanceCylinderAirbagData.create({
            data: updateDto.outerData as any,
          });
          updatePayload.outerDataId = created.id;
        }
      }

      if (updateDto.innerData) {
        if (existingRecord.innerDataId) {
          await (tx as any).counterbalanceCylinderAirbagData.update({
            where: { id: existingRecord.innerDataId },
            data: updateDto.innerData as any,
          });
        } else {
          const created = await (tx as any).counterbalanceCylinderAirbagData.create({
            data: updateDto.innerData as any,
          });
          updatePayload.innerDataId = created.id;
        }
      }

      if (updateDto.notes !== undefined) {
        updatePayload.notes = updateDto.notes;
      }

      if (Object.keys(updatePayload).length > 0) {
        await (tx as any).machineServiceCounterbalanceCylinderAirbag.update({
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
        counterbalanceCylinderAirbag: {
          create: {
            ...(updateDto.notes !== undefined && { notes: updateDto.notes }),
            ...(updateDto.outerData && {
              outerData: { create: updateDto.outerData as any },
            }),
            ...(updateDto.innerData && {
              innerData: { create: updateDto.innerData as any },
            }),
          },
        },
      },
    });
  }
}
