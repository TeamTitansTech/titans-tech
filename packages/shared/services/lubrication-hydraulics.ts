import { PrismaClient } from '@prisma/client';
import { LubricationHydraulicsCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdateLubricationHydraulicsResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updateLubricationHydraulics(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: LubricationHydraulicsCheck,
): Promise<UpdateLubricationHydraulicsResult> {
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
    include: { lubricationHydraulics: { include: { data: { include: { gauges: true } } } } },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes(
    'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
  )
    ? completedSections
    : [...completedSections, 'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER'];

  // 4. Upsert using existing function
  const existingRecord = service.lubricationHydraulics?.[0];
  await upsertLubricationHydraulics(
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

export async function upsertLubricationHydraulics(
  prisma: PrismaClient,
  serviceId: string,
  updateDto: LubricationHydraulicsCheck,
  existingRecord: any,
  updatedCompletedSections: string[],
) {
  const { data: lubData, notes } = updateDto;

  if (existingRecord) {
    await (prisma as any).$transaction(async (tx: any) => {
      if (existingRecord.dataId) {
        await (tx as any).lubricationHydraulicsGauge.deleteMany({
          where: { lubricationHydraulicsDataId: existingRecord.dataId },
        });

        const { gauges, ...restData } = lubData;

        await (tx as any).lubricationHydraulicsData.update({
          where: { id: existingRecord.dataId },
          data: {
            ...restData,
            gauges: gauges && gauges.length > 0 ? { create: gauges as any } : undefined,
          },
        });

        await (tx as any).machineServiceLubricationHydraulics.update({
          where: { id: existingRecord.id },
          data: { notes },
        });
      } else {
        const { gauges, ...restData } = lubData;

        await (tx as any).machineServiceLubricationHydraulics.update({
          where: { id: existingRecord.id },
          data: {
            notes,
            data: {
              create: {
                ...restData,
                gauges: gauges && gauges.length > 0 ? { create: gauges as any } : undefined,
              },
            },
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
    const { gauges, ...restData } = lubData;

    await (prisma as any).machineService.update({
      where: { id: serviceId },
      data: {
        completedSections: updatedCompletedSections,
        lastSectionSavedAt: new Date(),
        lubricationHydraulics: {
          create: {
            notes,
            data: {
              create: {
                ...restData,
                gauges: gauges && gauges.length > 0 ? { create: gauges as any } : undefined,
              },
            },
          },
        },
      },
    });
  }
}
