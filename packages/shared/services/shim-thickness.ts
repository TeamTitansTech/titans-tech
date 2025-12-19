import { PrismaClient } from '@prisma/client';
import { ShimThicknessCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdateShimThicknessResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updateShimThickness(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: ShimThicknessCheck,
): Promise<UpdateShimThicknessResult> {
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
    include: { shimThickness: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('SHIM_THICKNESS')
    ? completedSections
    : [...completedSections, 'SHIM_THICKNESS'];

  // 4. Upsert logic
  const existingRecord = service.shimThickness?.[0];

  const outerLhPrismaData = updateDto.outerLhData || null;
  const outerRhPrismaData = updateDto.outerRhData || null;
  const innerLhPrismaData = updateDto.innerLhData || null;
  const innerRhPrismaData = updateDto.innerRhData || null;

  if (existingRecord) {
    await (prisma as any).$transaction(async (tx: any) => {
      const updatePayload: any = {};

      // Outer LH
      if (outerLhPrismaData) {
        if (existingRecord.outerLhDataId) {
          await tx.shimThicknessData.update({
            where: { id: existingRecord.outerLhDataId },
            data: outerLhPrismaData,
          });
        } else {
          const created = await tx.shimThicknessData.create({
            data: outerLhPrismaData,
          });
          updatePayload.outerLhDataId = created.id;
        }
      }

      // Outer RH
      if (outerRhPrismaData) {
        if (existingRecord.outerRhDataId) {
          await tx.shimThicknessData.update({
            where: { id: existingRecord.outerRhDataId },
            data: outerRhPrismaData,
          });
        } else {
          const created = await tx.shimThicknessData.create({
            data: outerRhPrismaData,
          });
          updatePayload.outerRhDataId = created.id;
        }
      }

      // Inner LH
      if (innerLhPrismaData) {
        if (existingRecord.innerLhDataId) {
          await tx.shimThicknessData.update({
            where: { id: existingRecord.innerLhDataId },
            data: innerLhPrismaData,
          });
        } else {
          const created = await tx.shimThicknessData.create({
            data: innerLhPrismaData,
          });
          updatePayload.innerLhDataId = created.id;
        }
      }

      // Inner RH
      if (innerRhPrismaData) {
        if (existingRecord.innerRhDataId) {
          await tx.shimThicknessData.update({
            where: { id: existingRecord.innerRhDataId },
            data: innerRhPrismaData,
          });
        } else {
          const created = await tx.shimThicknessData.create({
            data: innerRhPrismaData,
          });
          updatePayload.innerRhDataId = created.id;
        }
      }

      // Handle notes
      if (updateDto.notes !== undefined) {
        updatePayload.notes = updateDto.notes;
      }

      if (Object.keys(updatePayload).length > 0) {
        await tx.machineServiceShimThickness.update({
          where: { id: existingRecord.id },
          data: updatePayload,
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
  } else {
    await (prisma as any).machineService.update({
      where: { id: serviceId },
      data: {
        completedSections: updatedCompletedSections,
        lastSectionSavedAt: new Date(),
        shimThickness: {
          create: {
            ...(outerLhPrismaData && {
              outerLhData: { create: outerLhPrismaData },
            }),
            ...(outerRhPrismaData && {
              outerRhData: { create: outerRhPrismaData },
            }),
            ...(innerLhPrismaData && {
              innerLhData: { create: innerLhPrismaData },
            }),
            ...(innerRhPrismaData && {
              innerRhData: { create: innerRhPrismaData },
            }),
            ...(updateDto.notes && { notes: updateDto.notes }),
          },
        },
      },
    });
  }

  // 5. Return updated service
  const updatedService = await findServiceById(prisma, serviceId);
  return { service: updatedService };
}
