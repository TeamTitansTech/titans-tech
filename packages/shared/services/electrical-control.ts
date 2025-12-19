import { PrismaClient } from '@prisma/client';
import { ElectricalControlCheck } from '@titans-tech/shared/backend-dtos';
import { validateServicePermissionByServiceId } from './permission-validator';
import { findServiceById } from './service';

export type UpdateElectricalControlResult =
  | { error: { code: 'NOT_FOUND' | 'FORBIDDEN'; message: string } }
  | { service: any };

export async function updateElectricalControl(
  prisma: PrismaClient,
  serviceId: string,
  userId: string | null,
  updateDto: ElectricalControlCheck,
): Promise<UpdateElectricalControlResult> {
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
    include: { electricalControl: true },
  });
  if (!service) {
    return { error: { code: 'NOT_FOUND', message: `Service with ID ${serviceId} not found` } };
  }

  // 3. Handle completedSections
  const completedSections = Array.isArray(service.completedSections)
    ? service.completedSections
    : [];
  const updatedCompletedSections = completedSections.includes('ELECTRICAL_CONTROL')
    ? completedSections
    : [...completedSections, 'ELECTRICAL_CONTROL'];

  // 4. Upsert logic
  const existingRecord = service.electricalControl?.[0];

  const data = {
    hasHourMeter: updateDto.hasHourMeter,
    hourMeterReading: updateDto.hourMeterReading,
    isMinsterControl: updateDto.isMinsterControl,
    minsterControlOther: updateDto.minsterControlOther,
    controlDoorStop: updateDto.controlDoorStop,
    cabinetTemp: updateDto.cabinetTemp,
    incomingLine: updateDto.incomingLine,
    fullVoltage: updateDto.fullVoltage,
    contactor: updateDto.contactor,
    overloads: updateDto.overloads,
    transformers: updateDto.transformers,
    brakeValve: updateDto.brakeValve,
    clutchValve: updateDto.clutchValve,
    wiring: updateDto.wiring,
    terminals: updateDto.terminals,
    twentyFourVBuss: updateDto.twentyFourVBuss,
    safetyRelays: updateDto.safetyRelays,
    notes: updateDto.notes,
  };

  if (existingRecord) {
    await (prisma as any).$transaction(async (tx: any) => {
      await tx.machineServiceElectricalControl.update({
        where: { id: existingRecord.id },
        data,
      });

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
        electricalControl: {
          create: data,
        },
      },
    });
  }

  // 5. Return updated service
  const updatedService = await findServiceById(prisma, serviceId);
  return { service: updatedService };
}
