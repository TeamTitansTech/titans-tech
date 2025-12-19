import { PrismaClient } from '@prisma/client';
import { PistonsCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdatePistonsResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updatePistons(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: PistonsCheck,
): Promise<UpdatePistonsResult> {
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
    include: { pistons: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('PISTONS')
    ? completedSections
    : [...completedSections, 'PISTONS'];

  // 4. Upsert using existing function
  const existingRecord = service.pistons?.[0];
  await upsertPistons(
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

export async function upsertPistons(
  prisma: PrismaClient,
  serviceId: string,
  updateDto: PistonsCheck,
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
          await (tx as any).pistonsData.update({
            where: { id: existingRecord.outerDataId },
            data: outerPrismaData as any,
          });
        } else {
          const created = await (tx as any).pistonsData.create({
            data: outerPrismaData as any,
          });
          updatePayload.outerDataId = created.id;
        }
      }

      if (innerPrismaData) {
        if (existingRecord.innerDataId) {
          await (tx as any).pistonsData.update({
            where: { id: existingRecord.innerDataId },
            data: innerPrismaData as any,
          });
        } else {
          const created = await (tx as any).pistonsData.create({
            data: innerPrismaData as any,
          });
          updatePayload.innerDataId = created.id;
        }
      }

      const metadataFields = [
        'guideSeals',
        'pistonSeals',
        'vacuumSystem',
        'vacuumSystemAirPressureSetting',
        'notes',
      ];

      metadataFields.forEach((field) => {
        if ((updateDto as any)[field] !== undefined) {
          updatePayload[field] = (updateDto as any)[field];
        }
      });

      if (Object.keys(updatePayload).length > 0) {
        await (tx as any).machineServicePistons.update({
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
        pistons: {
          create: {
            ...(outerPrismaData && {
              outerData: { create: outerPrismaData as any },
            }),
            ...(innerPrismaData && {
              innerData: { create: innerPrismaData as any },
            }),
            ...(updateDto.guideSeals && { guideSeals: updateDto.guideSeals }),
            ...(updateDto.pistonSeals && {
              pistonSeals: updateDto.pistonSeals,
            }),
            ...(updateDto.vacuumSystem && {
              vacuumSystem: updateDto.vacuumSystem,
            }),
            ...(updateDto.vacuumSystemAirPressureSetting !== undefined && {
              vacuumSystemAirPressureSetting: updateDto.vacuumSystemAirPressureSetting,
            }),
            ...(updateDto.notes && { notes: updateDto.notes }),
          },
        },
      },
    });
  }
}
