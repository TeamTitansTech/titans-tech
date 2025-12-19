import { PrismaClient } from '@prisma/client';
import { Prisma } from '@titans-tech/db';
import { CreateServiceDto } from '@titans-tech/shared/backend-dtos';

export async function createService(prisma: PrismaClient, createInspectionDto: CreateServiceDto) {
  const dataPayload: Prisma.MachineServiceCreateInput = {
    machine: {
      connect: { id: createInspectionDto.machineId },
    },
    ...(createInspectionDto.serviceRequestId && {
      serviceRequest: {
        connect: { id: createInspectionDto.serviceRequestId },
      },
    }),
    date: new Date(createInspectionDto.date),
    type: createInspectionDto.type,
    ...(createInspectionDto.status && {
      status: createInspectionDto.status,
    }),
    ...(createInspectionDto.performedBy && {
      performedBy: createInspectionDto.performedBy,
    }),
    ...(createInspectionDto.currentStep && {
      currentStep: createInspectionDto.currentStep,
    }),
    ...(createInspectionDto.currentSectionKey && {
      currentSectionKey: createInspectionDto.currentSectionKey,
    }),
    ...(createInspectionDto.selectedSections && {
      selectedSections: createInspectionDto.selectedSections,
    }),
  };

  const inspection = await (prisma as any).machineService.create({
    data: dataPayload,
    include: {
      machine: {
        include: {
          blueprint: true,
          fields: true,
          branch: true,
        },
      },
    },
  });

  return inspection;
}

import { UpdateServicePayload } from '@titans-tech/shared/backend-dtos';

export async function updateService(
  prisma: PrismaClient,
  serviceId: string,
  updateDto: UpdateServicePayload,
) {
  const updateData: any = {};

  if (updateDto.performedBy !== undefined) updateData.performedBy = updateDto.performedBy;
  if (updateDto.currentStep !== undefined) updateData.currentStep = updateDto.currentStep;
  if (updateDto.currentSectionKey !== undefined)
    updateData.currentSectionKey = updateDto.currentSectionKey;
  if (updateDto.selectedSections !== undefined)
    updateData.selectedSections = updateDto.selectedSections;

  if (updateDto.isPressLevel !== undefined) updateData.isPressLevel = updateDto.isPressLevel;
  if (updateDto.driveBeltCondition !== undefined)
    updateData.driveBeltCondition = updateDto.driveBeltCondition;
  if (updateDto.areAllProtectiveCovers !== undefined)
    updateData.areAllProtectiveCovers = updateDto.areAllProtectiveCovers;
  if (updateDto.protectiveCoversExplanation !== undefined)
    updateData.protectiveCoversExplanation = updateDto.protectiveCoversExplanation;
  if (updateDto.areCracksVisible !== undefined)
    updateData.areCracksVisible = updateDto.areCracksVisible;
  if (updateDto.cracksLocation !== undefined) updateData.cracksLocation = updateDto.cracksLocation;
  if (updateDto.isMainMotorSecure !== undefined)
    updateData.isMainMotorSecure = updateDto.isMainMotorSecure;
  if (updateDto.isMotorPlateSecure !== undefined)
    updateData.isMotorPlateSecure = updateDto.isMotorPlateSecure;
  if (updateDto.whyNotCovered !== undefined) updateData.whyNotCovered = updateDto.whyNotCovered;

  const updatedService = await (prisma as any).machineService.update({
    where: { id: serviceId },
    data: updateData,
    include: {
      machine: {
        include: { blueprint: true, fields: true, branch: true },
      },
      bearingClearance: {
        include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
      },
      slide: { include: { outerData: true, innerData: true } },
      slideSingleHammer: { include: { beforeData: true, data: true } },
      slideDoubleHammer: {
        include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
      },
      gibs: {
        include: {
          outerBefore: true,
          outerData: true,
          outerFreeHangingData: true,
          innerBefore: true,
          innerData: true,
          innerBeforeTool: true,
          innerDataTool: true,
        },
      },
      lubricationHydraulics: { include: { data: { include: { gauges: true } } } },
      clutch: { include: { data: true } },
      counterbalanceCylinderAirbag: { include: { outerData: true, innerData: true } },
      tramming: { include: { outerData: true, innerData: true } },
      pistons: { include: { outerData: true, innerData: true } },
    },
  });

  return updatedService;
}

export async function findAllServices(prisma: PrismaClient) {
  return (prisma as any).machineService.findMany({
    include: {
      machine: { include: { blueprint: true, fields: true, branch: true } },
      bearingClearance: {
        include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
      },
      slide: { include: { outerData: true, innerData: true } },
      slideSingleHammer: { include: { beforeData: true, data: true } },
      slideDoubleHammer: {
        include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
      },
      gibs: {
        include: {
          outerBefore: true,
          outerData: true,
          outerFreeHangingData: true,
          innerBefore: true,
          innerData: true,
          innerBeforeTool: true,
          innerDataTool: true,
        },
      },
      lubricationHydraulics: { include: { data: { include: { gauges: true } } } },
      clutch: { include: { data: true } },
      counterbalanceCylinderAirbag: { include: { outerData: true, innerData: true } },
      tramming: { include: { outerData: true, innerData: true } },
      pistons: { include: { outerData: true, innerData: true } },
    },
    orderBy: { date: 'desc' },
  });
}

export async function findServiceById(prisma: PrismaClient, id: string) {
  return (prisma as any).machineService.findUnique({
    where: { id },
    include: {
      machine: { include: { blueprint: true, fields: true, branch: true } },
      bearingClearance: {
        include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
      },
      slide: { include: { outerData: true, innerData: true } },
      slideSingleHammer: { include: { beforeData: true, data: true } },
      slideDoubleHammer: {
        include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
      },
      gibs: {
        include: {
          outerBefore: true,
          outerData: true,
          outerFreeHangingData: true,
          innerBefore: true,
          innerData: true,
          innerBeforeTool: true,
          innerDataTool: true,
        },
      },
      lubricationHydraulics: { include: { data: { include: { gauges: true } } } },
      clutch: { include: { data: true } },
      counterbalanceCylinderAirbag: { include: { outerData: true, innerData: true } },
      tramming: { include: { outerData: true, innerData: true } },
      pistons: { include: { outerData: true, innerData: true } },
    },
  });
}

export async function findServicesByMachine(prisma: PrismaClient, machineId: string) {
  return (prisma as any).machineService.findMany({
    where: { machineId },
    include: {
      machine: { include: { blueprint: true, fields: true, branch: true } },
      bearingClearance: {
        include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
      },
      slide: { include: { outerData: true, innerData: true } },
      slideSingleHammer: { include: { beforeData: true, data: true } },
      slideDoubleHammer: {
        include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
      },
      gibs: {
        include: {
          outerBefore: true,
          outerData: true,
          outerFreeHangingData: true,
          innerBefore: true,
          innerData: true,
          innerBeforeTool: true,
          innerDataTool: true,
        },
      },
      lubricationHydraulics: { include: { data: { include: { gauges: true } } } },
      clutch: { include: { data: true } },
      counterbalanceCylinderAirbag: { include: { outerData: true, innerData: true } },
      tramming: { include: { outerData: true, innerData: true } },
      pistons: { include: { outerData: true, innerData: true } },
      alertBearingClearance: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertClutch: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertSlide: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertSlideSingleHammer: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertSlideDoubleHammer: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertGibs: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertPistons: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertCounterbalanceCylinderAirbag: { orderBy: { createdAt: 'desc' }, take: 1 },
      alertTramming: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { date: 'desc' },
  });
}

export async function deleteService(prisma: PrismaClient, id: string): Promise<void> {
  await (prisma as any).machineService.delete({ where: { id } });
}

export async function completeServiceStatus(
  prisma: PrismaClient,
  serviceId: string,
  completeDto: { status?: string; completedBy?: string | null },
) {
  const updatedService = await (prisma as any).machineService.update({
    where: { id: serviceId },
    data: {
      status: completeDto.status || 'COMPLETED',
      ...(completeDto.completedBy && { performedBy: completeDto.completedBy }),
    },
    include: {
      machine: { include: { blueprint: true, fields: true } },
      bearingClearance: {
        include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
      },
      slide: { include: { outerData: true, innerData: true } },
      slideSingleHammer: { include: { beforeData: true, data: true } },
      slideDoubleHammer: {
        include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
      },
      gibs: {
        include: {
          outerBefore: true,
          outerData: true,
          outerFreeHangingData: true,
          innerBefore: true,
          innerData: true,
          innerBeforeTool: true,
          innerDataTool: true,
        },
      },
      lubricationHydraulics: { include: { data: { include: { gauges: true } } } },
      clutch: { include: { data: true } },
      counterbalanceCylinderAirbag: { include: { outerData: true, innerData: true } },
      tramming: { include: { outerData: true, innerData: true } },
      pistons: { include: { outerData: true, innerData: true } },
    },
  });

  return updatedService;
}

export async function getMachineWithBlueprint(prisma: PrismaClient, machineId: string) {
  return (prisma as any).machine.findUnique({
    where: { id: machineId },
    include: {
      blueprint: true,
      branch: true,
    },
  });
}

export async function findCompletedServicesByMachine(prisma: PrismaClient, machineId: string) {
  return (prisma as any).machineService.findMany({
    where: { machineId, status: 'COMPLETED' },
    include: {
      bearingClearance: {
        include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
      },
      slide: { include: { outerData: true, innerData: true } },
      slideSingleHammer: { include: { beforeData: true, data: true } },
      slideDoubleHammer: {
        include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
      },
      gibs: {
        include: {
          outerBefore: true,
          outerData: true,
          outerFreeHangingData: true,
          innerBefore: true,
          innerData: true,
          innerBeforeTool: true,
          innerDataTool: true,
        },
      },
      lubricationHydraulics: { include: { data: { include: { gauges: true } } } },
      clutch: { include: { data: true } },
      counterbalanceCylinderAirbag: { include: { outerData: true, innerData: true } },
      tramming: { include: { outerData: true, innerData: true } },
      pistons: { include: { outerData: true, innerData: true } },
    },
    orderBy: { date: 'desc' },
  });
}
