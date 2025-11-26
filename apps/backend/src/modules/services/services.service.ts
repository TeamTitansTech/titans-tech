import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { ServiceSection, ServiceStatus } from '@titans-tech/shared/enums';
import { PrismaService } from '../shared/prisma.service';
import {
  LatestReportResponseDto,
  LatestBearingClearanceDto,
  CreateServiceDto,
  UpdateServicePayload,
  CompleteServiceDto,
  BearingClearanceCheck,
  SlideCheck,
  GibsCheck,
  LubricationHydraulicsCheck,
  ClutchData,
  CounterbalanceCylinderCheck,
  TrammingCheck,
  PistonsCheck,
} from '@titans-tech/shared/backend-dtos';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class ServicesService {
  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService,
  ) {}

  async create(createInspectionDto: CreateServiceDto): Promise<
    Prisma.MachineServiceGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true; branch: true } };
      };
    }>
  > {
    // Verify machine exists and get its blueprint
    const machine = await this.prisma.machine.findUnique({
      where: { id: createInspectionDto.machineId },
      include: { blueprint: true },
    });

    if (!machine) {
      throw new NotFoundException(
        `Machine with ID ${createInspectionDto.machineId} not found`,
      );
    }

    // Create the inspection with only basic information
    // Sections will be added later via update endpoints
    const dataPayload: Prisma.MachineServiceCreateInput = {
      machine: {
        connect: { id: createInspectionDto.machineId },
      },
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
      // No sections are created during service creation
      // All sections will be added via individual PATCH endpoints
    };

    const inspection = await this.prisma.machineService.create({
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

  async update(
    serviceId: string,
    updateDto: UpdateServicePayload,
  ): Promise<any> {
    // Verify service exists
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    // Build the update data object with only the fields that are provided
    const updateData: Prisma.MachineServiceUpdateInput = {};

    // Basic service fields
    if (updateDto.performedBy !== undefined) {
      updateData.performedBy = updateDto.performedBy;
    }
    if (updateDto.currentStep !== undefined) {
      updateData.currentStep = updateDto.currentStep;
    }
    if (updateDto.currentSectionKey !== undefined) {
      updateData.currentSectionKey = updateDto.currentSectionKey;
    }

    // Inspection observation fields
    if (updateDto.isPressLevel !== undefined) {
      updateData.isPressLevel = updateDto.isPressLevel;
    }
    if (updateDto.driveBeltCondition !== undefined) {
      updateData.driveBeltCondition = updateDto.driveBeltCondition;
    }
    if (updateDto.areAllProtectiveCovers !== undefined) {
      updateData.areAllProtectiveCovers = updateDto.areAllProtectiveCovers;
    }
    if (updateDto.protectiveCoversExplanation !== undefined) {
      updateData.protectiveCoversExplanation =
        updateDto.protectiveCoversExplanation;
    }
    if (updateDto.areCracksVisible !== undefined) {
      updateData.areCracksVisible = updateDto.areCracksVisible;
    }
    if (updateDto.cracksLocation !== undefined) {
      updateData.cracksLocation = updateDto.cracksLocation;
    }
    if (updateDto.isMainMotorSecure !== undefined) {
      updateData.isMainMotorSecure = updateDto.isMainMotorSecure;
    }
    if (updateDto.isMotorPlateSecure !== undefined) {
      updateData.isMotorPlateSecure = updateDto.isMotorPlateSecure;
    }
    if (updateDto.whyNotCovered !== undefined) {
      updateData.whyNotCovered = updateDto.whyNotCovered;
    }

    // Update the service
    const updatedService = await this.prisma.machineService.update({
      where: { id: serviceId },
      data: updateData,
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
            branch: true,
          },
        },
        bearingClearance: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
            innerData: true,
          },
        },
        slide: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        gibs: true,
        lubricationHydraulics: {
          include: {
            data: {
              include: {
                gauges: true,
              },
            },
          },
        },
        clutch: {
          include: {
            data: true,
          },
        },
        counterbalanceCylinderAirbag: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        tramming: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        pistons: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
      },
    });

    return updatedService;
  }

  async findAll(): Promise<any[]> {
    return this.prisma.machineService.findMany({
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
            branch: true,
          },
        },
        bearingClearance: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
            innerData: true,
          },
        },
        slide: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        gibs: true,
        lubricationHydraulics: {
          include: {
            data: {
              include: {
                gauges: true,
              },
            },
          },
        },
        clutch: {
          include: {
            data: true,
          },
        },
        counterbalanceCylinderAirbag: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        tramming: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        pistons: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<any> {
    const inspection = await this.prisma.machineService.findUnique({
      where: { id },
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
            branch: true,
          },
        },
        bearingClearance: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
            innerData: true,
          },
        },
        slide: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        gibs: true,
        lubricationHydraulics: {
          include: {
            data: {
              include: {
                gauges: true,
              },
            },
          },
        },
        clutch: {
          include: {
            data: true,
          },
        },
        counterbalanceCylinderAirbag: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        tramming: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        pistons: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
      },
    });

    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }

    return inspection;
  }

  async findByMachine(machineId: string): Promise<any[]> {
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    return this.prisma.machineService.findMany({
      where: { machineId },
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
            branch: true,
          },
        },
        bearingClearance: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
            innerData: true,
          },
        },
        slide: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        gibs: true,
        lubricationHydraulics: {
          include: {
            data: {
              include: {
                gauges: true,
              },
            },
          },
        },
        clutch: {
          include: {
            data: true,
          },
        },
        counterbalanceCylinderAirbag: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        tramming: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        pistons: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  /**
   * Get the latest report for a machine showing the most recent data for each section
   * @param machineId - The machine ID
   * @returns LatestReportResponseDto with latest data per section
   */
  async getLatestReport(machineId: string): Promise<LatestReportResponseDto> {
    // 1. Fetch machine with blueprint
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
      include: {
        blueprint: true,
        branch: true,
      },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    // 2. Fetch all services for this machine, ordered by date DESC
    const services: any[] = await this.prisma.machineService.findMany({
      where: { machineId },
      include: {
        bearingClearance: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
            innerData: true,
          },
        },
        slide: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        gibs: true,
        lubricationHydraulics: {
          include: {
            data: {
              include: {
                gauges: true,
              },
            },
          },
        },
        clutch: {
          include: {
            data: true,
          },
        },
        counterbalanceCylinderAirbag: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        tramming: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        pistons: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // 3. Process BearingClearance section
    let bearingClearanceData: LatestBearingClearanceDto | null = null;

    if (machine.blueprint.sections.includes(ServiceSection.BEARING_CLEARANCE)) {
      // Find the most recent service with BearingClearance data
      const latestBearingService = services.find(
        (service) =>
          service.bearingClearance && service.bearingClearance.length > 0,
      );

      if (latestBearingService) {
        // Follow same logic as alerts: outerData || innerData
        const bearingData =
          latestBearingService.bearingClearance[0].outerData ||
          latestBearingService.bearingClearance[0].innerData;

        if (bearingData) {
          // Try to fetch alert for this service
          let alert = undefined;
          try {
            alert = await this.alertsService.getAlertByService(
              latestBearingService.id,
            );
          } catch {
            // Alert might not exist, that's fine
            console.log(
              `ℹ️ [SERVICES] No alert found for service ${latestBearingService.id}`,
            );
          }

          bearingClearanceData = new LatestBearingClearanceDto({
            latestServiceId: latestBearingService.id,
            latestServiceDate: latestBearingService.date,
            serviceType: latestBearingService.type,
            data: bearingData,
            alert: alert || undefined,
          });
        }
      }
    }

    // 4. Build response
    return new LatestReportResponseDto({
      machineId: machine.id,
      machineName: machine.name,
      blueprint: {
        id: machine.blueprint.id,
        name: machine.blueprint.name,
        sections: machine.blueprint.sections,
      },
      generatedAt: new Date(),
      sections: {
        BEARING_CLEARANCE: bearingClearanceData,
        SLIDE: null,
        GIBS: null,
        LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: null,
        CLUTCH: null,
        COUNTERBALANCE_CYLINDER_AIRBAG: null,
      },
    });
  }

  // Section Update Methods

  async updateBearingClearance(
    serviceId: string,
    updateDto: BearingClearanceCheck,
  ): Promise<any> {
    // Check if service exists
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { bearingClearance: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    // Get existing completed sections
    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    // Add BEARING_CLEARANCE to completed if not already there
    const updatedCompletedSections = completedSections.includes(
      'BEARING_CLEARANCE',
    )
      ? completedSections
      : [...completedSections, 'BEARING_CLEARANCE'];

    await this.prisma.$transaction(async (tx) => {
      const existingRecord = service.bearingClearance?.[0];

      // Helper function to upsert nested bearing clearance data
      const upsertData = async (
        data: any,
        existingId: string | null | undefined,
      ) => {
        if (!data) return existingId;

        if (existingId) {
          // Update existing
          await tx.bearingClearanceData.update({
            where: { id: existingId },
            data: data as any,
          });
          return existingId;
        } else {
          // Create new
          const created = await tx.bearingClearanceData.create({
            data: data as any,
          });
          return created.id;
        }
      };

      if (existingRecord) {
        // Update existing bearing clearance record
        const outerBeforeId = await upsertData(
          updateDto.outerBefore,
          existingRecord.outerBeforeId,
        );
        const outerDataId = await upsertData(
          updateDto.outerData,
          existingRecord.outerDataId,
        );
        const innerBeforeId = await upsertData(
          updateDto.innerBefore,
          existingRecord.innerBeforeId,
        );
        const innerDataId = await upsertData(
          updateDto.innerData,
          existingRecord.innerDataId,
        );

        await tx.machineServiceBearingClearance.update({
          where: { id: existingRecord.id },
          data: {
            ...(outerBeforeId && { outerBeforeId }),
            ...(outerDataId && { outerDataId }),
            ...(innerBeforeId && { innerBeforeId }),
            ...(innerDataId && { innerDataId }),
          },
        });
      } else {
        // Create new bearing clearance record
        await tx.machineServiceBearingClearance.create({
          data: {
            machineService: { connect: { id: serviceId } },
            ...(updateDto.outerBefore && {
              outerBefore: { create: updateDto.outerBefore as any },
            }),
            ...(updateDto.outerData && {
              outerData: { create: updateDto.outerData as any },
            }),
            ...(updateDto.innerBefore && {
              innerBefore: { create: updateDto.innerBefore as any },
            }),
            ...(updateDto.innerData && {
              innerData: { create: updateDto.innerData as any },
            }),
          },
        });
      }

      // Update service with completed sections
      await tx.machineService.update({
        where: { id: serviceId },
        data: {
          completedSections: updatedCompletedSections,
          lastSectionSavedAt: new Date(),
        },
      });
    });

    // Generate alerts if bearing clearance data was updated
    if (updateDto.outerData || updateDto.innerData) {
      try {
        await this.alertsService.generateAlertsForService(serviceId);
      } catch (error) {
        console.error('Error generating alerts:', error);
      }
    }

    // Return updated service
    return this.findOne(serviceId);
  }

  async updateSlide(serviceId: string, updateDto: SlideCheck): Promise<any> {
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { slide: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes('SLIDE')
      ? completedSections
      : [...completedSections, 'SLIDE'];

    await this.prisma.$transaction(async (tx) => {
      const existingRecord = service.slide?.[0];

      // Helper function to upsert nested slide data (now contains all fields)
      const upsertData = async (
        data: any,
        existingId: string | null | undefined,
      ) => {
        if (!data) return existingId;

        if (existingId) {
          await tx.slideData.update({
            where: { id: existingId },
            data: data as any,
          });
          return existingId;
        } else {
          const created = await tx.slideData.create({
            data: data as any,
          });
          return created.id;
        }
      };

      if (existingRecord) {
        // Update existing slide record
        const outerDataId = await upsertData(
          updateDto.outerData,
          existingRecord.outerDataId,
        );
        const innerDataId = await upsertData(
          updateDto.innerData,
          existingRecord.innerDataId,
        );

        // Build update payload with IDs and notes
        const updatePayload: any = {
          ...(outerDataId && { outerDataId }),
          ...(innerDataId && { innerDataId }),
          ...(updateDto.notes !== undefined && { notes: updateDto.notes }),
        };

        await tx.machineServiceSlide.update({
          where: { id: existingRecord.id },
          data: updatePayload,
        });
      } else {
        // Create new slide record
        const { outerData, innerData, notes } = updateDto;

        await tx.machineServiceSlide.create({
          data: {
            machineService: { connect: { id: serviceId } },
            ...(outerData && {
              outerData: { create: outerData as any },
            }),
            ...(innerData && {
              innerData: { create: innerData as any },
            }),
            ...(notes && { notes }),
          },
        });
      }

      // Update service with completed sections
      await tx.machineService.update({
        where: { id: serviceId },
        data: {
          completedSections: updatedCompletedSections,
          lastSectionSavedAt: new Date(),
        },
      });
    });

    return this.findOne(serviceId);
  }

  /**
   * Helper method to upsert a GIBS stage (update if exists, create if not)
   * @param tx Prisma transaction client
   * @param stageData The stage data to upsert
   * @param existingId The existing stage ID (if any)
   * @param updatePayload The payload object to update with the new ID
   * @param fieldName The field name for the ID in the updatePayload
   */
  private async upsertGibsStage(
    tx: any,
    stageData: any,
    existingId: string | null | undefined,
    updatePayload: Record<string, any>,
    fieldName: string,
  ): Promise<void> {
    if (!stageData) return;

    if (existingId) {
      await tx.service_data_gibs_stage.update({
        where: { id: existingId },
        data: stageData,
      });
    } else {
      const created = await tx.service_data_gibs_stage.create({
        data: stageData,
      });
      updatePayload[fieldName] = created.id;
    }
  }

  async updateGibs(serviceId: string, updateDto: GibsCheck): Promise<any> {
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { gibs: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes('GIBS')
      ? completedSections
      : [...completedSections, 'GIBS'];

    const existingRecord: any = service.gibs?.[0];

    if (existingRecord) {
      await this.prisma.$transaction(async (tx) => {
        const updatePayload: Record<string, any> = {};

        // Handle all 7 GIBS stages using the helper method
        await this.upsertGibsStage(
          tx,
          updateDto.outerBeforeAdjustment,
          existingRecord.outerBeforeAdjustmentId,
          updatePayload,
          'outerBeforeAdjustmentId',
        );

        await this.upsertGibsStage(
          tx,
          updateDto.outerAfterAdjustment,
          existingRecord.outerAfterAdjustmentId,
          updatePayload,
          'outerAfterAdjustmentId',
        );

        await this.upsertGibsStage(
          tx,
          updateDto.outerFreeHangingAfterInstall,
          existingRecord.outerFreeHangingAfterInstallId,
          updatePayload,
          'outerFreeHangingAfterInstallId',
        );

        await this.upsertGibsStage(
          tx,
          updateDto.innerBeforeAdjustment,
          existingRecord.innerBeforeAdjustmentId,
          updatePayload,
          'innerBeforeAdjustmentId',
        );

        await this.upsertGibsStage(
          tx,
          updateDto.innerAfterAdjustment,
          existingRecord.innerAfterAdjustmentId,
          updatePayload,
          'innerAfterAdjustmentId',
        );

        await this.upsertGibsStage(
          tx,
          updateDto.innerBeforeToolInstallation,
          existingRecord.innerBeforeToolInstallationId,
          updatePayload,
          'innerBeforeToolInstallationId',
        );

        await this.upsertGibsStage(
          tx,
          updateDto.innerAfterToolInstallation,
          existingRecord.innerAfterToolInstallationId,
          updatePayload,
          'innerAfterToolInstallationId',
        );

        if (updateDto.notes !== undefined) {
          updatePayload.notes = updateDto.notes;
        }

        if (Object.keys(updatePayload).length > 0) {
          await tx.machineServiceGibs.update({
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
      await this.prisma.machineService.update({
        where: { id: serviceId },
        data: {
          completedSections: updatedCompletedSections,
          lastSectionSavedAt: new Date(),
          gibs: {
            create: {
              ...(updateDto.outerBeforeAdjustment && {
                service_data_gibs_stage_machine_service_gibs_outerBeforeAdjustmentIdToservice_data_gibs_stage:
                  {
                    create: updateDto.outerBeforeAdjustment,
                  },
              }),
              ...(updateDto.outerAfterAdjustment && {
                service_data_gibs_stage_machine_service_gibs_outerAfterAdjustmentIdToservice_data_gibs_stage:
                  {
                    create: updateDto.outerAfterAdjustment,
                  },
              }),
              ...(updateDto.outerFreeHangingAfterInstall && {
                service_data_gibs_stage_machine_service_gibs_outerFreeHangingAfterInstallIdToservice_data_gibs_stage:
                  {
                    create: updateDto.outerFreeHangingAfterInstall,
                  },
              }),
              ...(updateDto.innerBeforeAdjustment && {
                service_data_gibs_stage_machine_service_gibs_innerBeforeAdjustmentIdToservice_data_gibs_stage:
                  {
                    create: updateDto.innerBeforeAdjustment,
                  },
              }),
              ...(updateDto.innerAfterAdjustment && {
                service_data_gibs_stage_machine_service_gibs_innerAfterAdjustmentIdToservice_data_gibs_stage:
                  {
                    create: updateDto.innerAfterAdjustment,
                  },
              }),
              ...(updateDto.innerBeforeToolInstallation && {
                service_data_gibs_stage_machine_service_gibs_innerBeforeToolInstallationIdToservice_data_gibs_stage:
                  {
                    create: updateDto.innerBeforeToolInstallation,
                  },
              }),
              ...(updateDto.innerAfterToolInstallation && {
                service_data_gibs_stage_machine_service_gibs_innerAfterToolInstallationIdToservice_data_gibs_stage:
                  {
                    create: updateDto.innerAfterToolInstallation,
                  },
              }),
              ...(updateDto.notes && { notes: updateDto.notes }),
            } as any,
          },
        },
      });
    }

    return this.findOne(serviceId);
  }

  async updateLubricationHydraulics(
    serviceId: string,
    updateDto: LubricationHydraulicsCheck,
  ): Promise<any> {
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { lubricationHydraulics: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes(
      'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
    )
      ? completedSections
      : [
          ...completedSections,
          'LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER',
        ];

    const existingRecord = service.lubricationHydraulics?.[0];
    const { data: lubData, notes } = updateDto;

    if (existingRecord) {
      await this.prisma.$transaction(async (tx) => {
        if (existingRecord.dataId) {
          // Delete existing gauges and recreate
          await tx.lubricationHydraulicsGauge.deleteMany({
            where: { lubricationHydraulicsDataId: existingRecord.dataId },
          });

          const { gauges, ...restData } = lubData;

          await tx.lubricationHydraulicsData.update({
            where: { id: existingRecord.dataId },
            data: {
              ...restData,
              gauges:
                gauges && gauges.length > 0
                  ? { create: gauges as any }
                  : undefined,
            },
          });

          // Update notes in junction table
          await tx.machineServiceLubricationHydraulics.update({
            where: { id: existingRecord.id },
            data: { notes },
          });
        } else {
          // Create new data record
          const { gauges, ...restData } = lubData;

          await tx.machineServiceLubricationHydraulics.update({
            where: { id: existingRecord.id },
            data: {
              notes,
              data: {
                create: {
                  ...restData,
                  gauges:
                    gauges && gauges.length > 0
                      ? { create: gauges as any }
                      : undefined,
                },
              },
            },
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
      const { gauges, ...restData } = lubData;

      await this.prisma.machineService.update({
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
                  gauges:
                    gauges && gauges.length > 0
                      ? { create: gauges as any }
                      : undefined,
                },
              },
            },
          },
        },
      });
    }

    return this.findOne(serviceId);
  }

  async updateClutch(serviceId: string, updateDto: ClutchData): Promise<any> {
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { clutch: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes('CLUTCH')
      ? completedSections
      : [...completedSections, 'CLUTCH'];

    const existingRecord = service.clutch?.[0];

    if (existingRecord) {
      await this.prisma.$transaction(async (tx) => {
        if (existingRecord.dataId) {
          await tx.clutchData.update({
            where: { id: existingRecord.dataId },
            data: updateDto as any,
          });
        } else {
          await tx.machineServiceClutch.update({
            where: { id: existingRecord.id },
            data: {
              data: { create: updateDto as any },
            },
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
      await this.prisma.machineService.update({
        where: { id: serviceId },
        data: {
          completedSections: updatedCompletedSections,
          lastSectionSavedAt: new Date(),
          clutch: {
            create: {
              data: { create: updateDto as any },
            },
          },
        },
      });
    }

    return this.findOne(serviceId);
  }

  async updateCounterbalanceCylinder(
    serviceId: string,
    updateDto: CounterbalanceCylinderCheck,
  ): Promise<any> {
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { counterbalanceCylinderAirbag: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes(
      'COUNTERBALANCE_CYLINDER_AIRBAG',
    )
      ? completedSections
      : [...completedSections, 'COUNTERBALANCE_CYLINDER_AIRBAG'];

    const existingRecord = service.counterbalanceCylinderAirbag?.[0];

    if (existingRecord) {
      await this.prisma.$transaction(async (tx) => {
        const updatePayload: any = {};

        if (updateDto.outerData) {
          if (existingRecord.outerDataId) {
            await tx.counterbalanceCylinderAirbagData.update({
              where: { id: existingRecord.outerDataId },
              data: updateDto.outerData as any,
            });
          } else {
            const created = await tx.counterbalanceCylinderAirbagData.create({
              data: updateDto.outerData as any,
            });
            updatePayload.outerDataId = created.id;
          }
        }

        if (updateDto.innerData) {
          if (existingRecord.innerDataId) {
            await tx.counterbalanceCylinderAirbagData.update({
              where: { id: existingRecord.innerDataId },
              data: updateDto.innerData as any,
            });
          } else {
            const created = await tx.counterbalanceCylinderAirbagData.create({
              data: updateDto.innerData as any,
            });
            updatePayload.innerDataId = created.id;
          }
        }

        // Handle notes at the service level
        if (updateDto.notes !== undefined) {
          updatePayload.notes = updateDto.notes;
        }

        if (Object.keys(updatePayload).length > 0) {
          await tx.machineServiceCounterbalanceCylinderAirbag.update({
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
      await this.prisma.machineService.update({
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

    return this.findOne(serviceId);
  }

  async updateTramming(
    serviceId: string,
    updateDto: TrammingCheck,
  ): Promise<any> {
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { tramming: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes('TRAMMING')
      ? completedSections
      : [...completedSections, 'TRAMMING'];

    const existingRecord = service.tramming?.[0];

    if (existingRecord) {
      await this.prisma.$transaction(async (tx) => {
        const updatePayload: any = {};

        if (updateDto.outerData) {
          if (existingRecord.outerDataId) {
            await tx.trammingData.update({
              where: { id: existingRecord.outerDataId },
              data: updateDto.outerData as any,
            });
          } else {
            const created = await tx.trammingData.create({
              data: updateDto.outerData as any,
            });
            updatePayload.outerDataId = created.id;
          }
        }

        if (updateDto.innerData) {
          if (existingRecord.innerDataId) {
            await tx.trammingData.update({
              where: { id: existingRecord.innerDataId },
              data: updateDto.innerData as any,
            });
          } else {
            const created = await tx.trammingData.create({
              data: updateDto.innerData as any,
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
          await tx.machineServiceTramming.update({
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
      await this.prisma.machineService.update({
        where: { id: serviceId },
        data: {
          completedSections: updatedCompletedSections,
          lastSectionSavedAt: new Date(),
          tramming: {
            create: {
              ...(updateDto.outerData && {
                outerData: { create: updateDto.outerData as any },
              }),
              ...(updateDto.innerData && {
                innerData: { create: updateDto.innerData as any },
              }),
              ...(updateDto.slideTram && { slideTram: updateDto.slideTram }),
              ...(updateDto.notes && { notes: updateDto.notes }),
            } as any,
          },
        },
      });
    }

    return this.findOne(serviceId);
  }

  async updatePistons(
    serviceId: string,
    updateDto: PistonsCheck,
  ): Promise<any> {
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { pistons: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes('PISTONS')
      ? completedSections
      : [...completedSections, 'PISTONS'];

    const existingRecord = service.pistons?.[0];

    if (existingRecord) {
      await this.prisma.$transaction(async (tx) => {
        const updatePayload: any = {};

        if (updateDto.outerData) {
          if (existingRecord.outerDataId) {
            await tx.pistonsData.update({
              where: { id: existingRecord.outerDataId },
              data: updateDto.outerData as any,
            });
          } else {
            const created = await tx.pistonsData.create({
              data: updateDto.outerData as any,
            });
            updatePayload.outerDataId = created.id;
          }
        }

        if (updateDto.innerData) {
          if (existingRecord.innerDataId) {
            await tx.pistonsData.update({
              where: { id: existingRecord.innerDataId },
              data: updateDto.innerData as any,
            });
          } else {
            const created = await tx.pistonsData.create({
              data: updateDto.innerData as any,
            });
            updatePayload.innerDataId = created.id;
          }
        }

        // Handle metadata fields
        const metadataFields = [
          'guideSeals',
          'pistonSeals',
          'vacuumSystem',
          'vacuumSystemAirPressureSetting',
          'vacuumSystemAirPressureUnit',
          'unit',
          'notes',
        ];

        metadataFields.forEach((field) => {
          if ((updateDto as any)[field] !== undefined) {
            updatePayload[field] = (updateDto as any)[field];
          }
        });

        if (Object.keys(updatePayload).length > 0) {
          await tx.machineServicePistons.update({
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
      await this.prisma.machineService.update({
        where: { id: serviceId },
        data: {
          completedSections: updatedCompletedSections,
          lastSectionSavedAt: new Date(),
          pistons: {
            create: {
              ...(updateDto.outerData && {
                outerData: { create: updateDto.outerData as any },
              }),
              ...(updateDto.innerData && {
                innerData: { create: updateDto.innerData as any },
              }),
              ...(updateDto.guideSeals && { guideSeals: updateDto.guideSeals }),
              ...(updateDto.pistonSeals && {
                pistonSeals: updateDto.pistonSeals,
              }),
              ...(updateDto.vacuumSystem && {
                vacuumSystem: updateDto.vacuumSystem,
              }),
              ...(updateDto.vacuumSystemAirPressureSetting !== undefined && {
                vacuumSystemAirPressureSetting:
                  updateDto.vacuumSystemAirPressureSetting,
              }),
              ...(updateDto.vacuumSystemAirPressureUnit && {
                vacuumSystemAirPressureUnit:
                  updateDto.vacuumSystemAirPressureUnit,
              }),
              ...(updateDto.unit && { unit: updateDto.unit }),
              ...(updateDto.notes && { notes: updateDto.notes }),
            },
          },
        },
      });
    }

    return this.findOne(serviceId);
  }

  async completeService(
    serviceId: string,
    completeDto: CompleteServiceDto,
  ): Promise<any> {
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    // Check if all selected sections are completed
    const selectedSections = Array.isArray(service.selectedSections)
      ? service.selectedSections
      : [];
    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    if (selectedSections.length > 0) {
      const missingSections = (selectedSections as string[]).filter(
        (section) => !(completedSections as string[]).includes(section),
      );

      if (missingSections.length > 0) {
        throw new BadRequestException(
          `Cannot complete service. The following sections are not completed: ${missingSections.join(', ')}`,
        );
      }
    }

    // Update service status to completed
    const updatedService = await this.prisma.machineService.update({
      where: { id: serviceId },
      data: {
        status: completeDto.status || ServiceStatus.COMPLETED,
        ...(completeDto.completedBy && {
          performedBy: completeDto.completedBy,
        }),
      },
      include: {
        machine: { include: { blueprint: true, fields: true } },
        bearingClearance: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
            innerData: true,
          },
        },
        slide: {
          include: {
            outerData: true,
            innerData: true,
          },
        },
        gibs: true,
        lubricationHydraulics: {
          include: { data: { include: { gauges: true } } },
        },
        clutch: { include: { data: true } },
        counterbalanceCylinderAirbag: {
          include: { outerData: true, innerData: true },
        },
        tramming: {
          include: { outerData: true, innerData: true },
        },
        pistons: {
          include: { outerData: true, innerData: true },
        },
      },
    });

    this.alertsService.generateAlertsForService(serviceId);
    return updatedService;
  }

  async delete(id: string): Promise<void> {
    // Verify service exists
    const service = await this.prisma.machineService.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    // Delete the service (cascade delete will handle related data)
    await this.prisma.machineService.delete({
      where: { id },
    });
  }
}
