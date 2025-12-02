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
  LatestClutchDto,
  LatestSlideDto,
  LatestGibsDto,
  LatestLubricationDto,
  LatestCounterbalanceDto,
  LatestPistonsDto,
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
  AlertsSummaryResponseDto,
  SectionAlertDto,
  AlertDetailDto,
  AlertSeverityDto,
} from '@titans-tech/shared/backend-dtos';
import { AlertsService } from '../alerts/alerts.service';
import {
  OIL_CHANGE_INTERVAL_DAYS,
  OIL_CHANGE_WARNING_THRESHOLD_DAYS,
} from './services.constants';

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
    if (updateDto.selectedSections !== undefined) {
      updateData.selectedSections = updateDto.selectedSections;
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
        const bearingRecord = latestBearingService.bearingClearance[0];
        const outerData = bearingRecord.outerData;
        const innerData = bearingRecord.innerData;

        // Only proceed if we have at least one data set
        if (outerData || innerData) {
          // Try to fetch alert for this service
          let alert = undefined;
          try {
            alert = await this.alertsService.getAlertByService(
              latestBearingService.id,
            );
          } catch {
            // Alert might not exist, that's fine
          }

          bearingClearanceData = new LatestBearingClearanceDto({
            latestServiceId: latestBearingService.id,
            latestServiceDate: latestBearingService.date,
            serviceType: latestBearingService.type,
            outerData: outerData || undefined,
            innerData: innerData || undefined,
            alert: alert || undefined,
          });
        }
      }
    }

    // 4. Process Clutch section
    let clutchData: LatestClutchDto | null = null;

    if (machine.blueprint.sections.includes(ServiceSection.CLUTCH)) {
      // Find the most recent service with Clutch data
      const latestClutchService = services.find(
        (service) => service.clutch && service.clutch.length > 0,
      );

      if (latestClutchService) {
        const clutchMeasurements = latestClutchService.clutch[0].data;

        if (clutchMeasurements) {
          // Try to fetch alert for this service
          let alert = undefined;
          try {
            alert = await this.alertsService.getClutchAlertByService(
              latestClutchService.id,
            );
          } catch {
            // Alert might not exist, that's fine
          }

          clutchData = new LatestClutchDto({
            latestServiceId: latestClutchService.id,
            latestServiceDate: latestClutchService.date,
            serviceType: latestClutchService.type,
            data: clutchMeasurements,
            alert: alert || undefined,
          });
        }
      }
    }

    // 5. Process Slide section
    let slideData: LatestSlideDto | null = null;

    if (machine.blueprint.sections.includes(ServiceSection.SLIDE)) {
      // Find the most recent service with Slide data
      const latestSlideService = services.find(
        (service) => service.slide && service.slide.length > 0,
      );

      if (latestSlideService) {
        const slideRecord = latestSlideService.slide[0];

        if (slideRecord) {
          // Try to fetch alert for this service
          let alert = undefined;
          try {
            alert = await this.alertsService.getSlideAlertByService(
              latestSlideService.id,
            );
          } catch {
            // Alert might not exist, that's fine
          }

          slideData = new LatestSlideDto({
            latestServiceId: latestSlideService.id,
            latestServiceDate: latestSlideService.date,
            serviceType: latestSlideService.type,
            data: {
              outerData: slideRecord.outerData,
              innerData: slideRecord.innerData,
            },
            alert: alert || undefined,
          });
        }
      }
    }

    // 6. Process GIBS section
    let gibsData: LatestGibsDto | null = null;

    if (machine.blueprint.sections.includes(ServiceSection.GIBS)) {
      // Find the most recent service with GIBS data
      const latestGibsService = services.find(
        (service) => service.gibs && service.gibs.length > 0,
      );

      if (latestGibsService) {
        const gibsRecord = latestGibsService.gibs[0];

        if (gibsRecord && gibsRecord.outerData) {
          // Try to fetch alert for this service
          let alert = undefined;
          try {
            alert = await this.alertsService.getGibsAlertByService(
              latestGibsService.id,
            );
          } catch {
            // Alert might not exist, that's fine
          }

          gibsData = new LatestGibsDto({
            latestServiceId: latestGibsService.id,
            latestServiceDate: latestGibsService.date,
            serviceType: latestGibsService.type,
            data: gibsRecord.outerData,
            alert: alert || undefined,
          });
        }
      }
    }

    // 7. Process Lubrication & Hydraulics section
    let lubricationData: LatestLubricationDto | null = null;

    if (
      machine.blueprint.sections.includes(
        ServiceSection.LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER,
      )
    ) {
      // Find the most recent service with Lubrication data
      const latestLubricationService = services.find(
        (service) =>
          service.lubricationHydraulics &&
          service.lubricationHydraulics.length > 0 &&
          service.lubricationHydraulics[0].data,
      );

      if (latestLubricationService) {
        const lubricationRecord =
          latestLubricationService.lubricationHydraulics[0];

        if (lubricationRecord && lubricationRecord.data) {
          // Calculate oil change alert

          // Find the last service where oil was changed
          let oilChangeAlert: {
            lastOilChangeDate: Date | null;
            daysSinceChange: number | null;
            daysUntilDue: number | null;
            severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED';
          } = {
            lastOilChangeDate: null,
            daysSinceChange: null,
            daysUntilDue: null,
            severity: 'NONE',
          };

          // Search all services for last oil change
          for (const service of services) {
            const lubData = service.lubricationHydraulics?.[0]?.data;
            if (lubData?.changedOil === 'YES') {
              const changeDate = new Date(service.date);
              const today = new Date();
              const daysSinceChange = Math.floor(
                (today.getTime() - changeDate.getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              const daysUntilDue = OIL_CHANGE_INTERVAL_DAYS - daysSinceChange;

              let severity: 'NONE' | 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
              if (daysUntilDue < 0) {
                severity = 'RED';
              } else if (daysUntilDue <= OIL_CHANGE_WARNING_THRESHOLD_DAYS) {
                severity = 'YELLOW';
              }

              oilChangeAlert = {
                lastOilChangeDate: changeDate,
                daysSinceChange,
                daysUntilDue,
                severity,
              };
              break; // Found the most recent oil change
            }
          }

          lubricationData = new LatestLubricationDto({
            latestServiceId: latestLubricationService.id,
            latestServiceDate: latestLubricationService.date,
            serviceType: latestLubricationService.type,
            data: {
              ...lubricationRecord.data,
              gauges: lubricationRecord.data.gauges || [],
            },
            alert:
              oilChangeAlert.severity !== 'NONE' ? oilChangeAlert : undefined,
          });
        }
      }
    }

    // 8. Process Counterbalance Cylinder/Airbag section
    let counterbalanceData: LatestCounterbalanceDto | null = null;

    if (
      machine.blueprint.sections.includes(
        ServiceSection.COUNTERBALANCE_CYLINDER_AIRBAG,
      )
    ) {
      // Find the most recent service with Counterbalance data
      const latestCounterbalanceService = services.find(
        (service) =>
          service.counterbalanceCylinderAirbag &&
          service.counterbalanceCylinderAirbag.length > 0,
      );

      if (latestCounterbalanceService) {
        const counterbalanceRecord =
          latestCounterbalanceService.counterbalanceCylinderAirbag[0];

        if (counterbalanceRecord) {
          // Try to fetch alerts for this service
          let alerts = undefined;
          try {
            alerts = await this.alertsService.getCounterbalanceAlertsForService(
              latestCounterbalanceService.id,
            );
          } catch {
            // Alerts might not exist, that's fine
          }

          counterbalanceData = new LatestCounterbalanceDto({
            latestServiceId: latestCounterbalanceService.id,
            latestServiceDate: latestCounterbalanceService.date,
            serviceType: latestCounterbalanceService.type,
            data: {
              outerData: counterbalanceRecord.outerData || undefined,
              innerData: counterbalanceRecord.innerData || undefined,
              notes: counterbalanceRecord.notes || undefined,
            },
            alerts: alerts && alerts.length > 0 ? alerts : undefined,
          });
        }
      }
    }

    // 9. Process Pistons section
    let pistonsData: LatestPistonsDto | null = null;

    if (machine.blueprint.sections.includes(ServiceSection.PISTONS)) {
      // Find the most recent service with Pistons data
      const latestPistonsService = services.find(
        (service) => service.pistons && service.pistons.length > 0,
      );

      if (latestPistonsService) {
        const pistonsRecord = latestPistonsService.pistons[0];
        const outerData = pistonsRecord.outerData;
        const innerData = pistonsRecord.innerData;

        // Only proceed if we have at least one data set
        if (outerData || innerData) {
          // Try to fetch alert for this service
          let alert = undefined;
          try {
            alert = await this.alertsService.getPistonsAlertByService(
              latestPistonsService.id,
            );
          } catch {
            // Alert might not exist, that's fine
          }

          pistonsData = new LatestPistonsDto({
            latestServiceId: latestPistonsService.id,
            latestServiceDate: latestPistonsService.date,
            serviceType: latestPistonsService.type,
            data: {
              guideSeals: pistonsRecord.guideSeals,
              pistonSeals: pistonsRecord.pistonSeals,
              vacuumSystem: pistonsRecord.vacuumSystem,
              vacuumSystemAirPressureSetting:
                pistonsRecord.vacuumSystemAirPressureSetting,
              vacuumSystemAirPressureUnit:
                pistonsRecord.vacuumSystemAirPressureUnit,
              unit: pistonsRecord.unit,
              outerData: outerData || undefined,
              innerData: innerData || undefined,
              notes: pistonsRecord.notes,
            },
            alert: alert || undefined,
          });
        }
      }
    }

    // 10. Build response
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
        SLIDE: slideData,
        GIBS: gibsData,
        PISTONS: pistonsData,
        LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: lubricationData,
        CLUTCH: clutchData,
        COUNTERBALANCE_CYLINDER_AIRBAG: counterbalanceData,
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

      // Helper function to upsert nested slide data
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
        // Update existing slide record (now with 4 possible FKs)
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

        // Build update payload with IDs and notes
        const updatePayload: any = {
          ...(outerBeforeId && { outerBeforeId }),
          ...(outerDataId && { outerDataId }),
          ...(innerBeforeId && { innerBeforeId }),
          ...(innerDataId && { innerDataId }),
          ...(updateDto.notes !== undefined && { notes: updateDto.notes }),
        };

        await tx.machineServiceSlide.update({
          where: { id: existingRecord.id },
          data: updatePayload,
        });
      } else {
        // Create new slide record with 4 possible SlideData records
        const { outerBefore, outerData, innerBefore, innerData, notes } =
          updateDto;

        await tx.machineServiceSlide.create({
          data: {
            machineService: { connect: { id: serviceId } },
            ...(outerBefore && {
              outerBefore: { create: outerBefore as any },
            }),
            ...(outerData && {
              outerData: { create: outerData as any },
            }),
            ...(innerBefore && {
              innerBefore: { create: innerBefore as any },
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

    if (updateDto.outerData || updateDto.innerData) {
      try {
        await this.alertsService.generateAlertsForSlide(serviceId);
      } catch (error) {
        console.error('Error generating slide alerts:', error);
      }
    }

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
      await tx.gibsStageData.update({
        where: { id: existingId },
        data: stageData,
      });
    } else {
      const created = await tx.gibsStageData.create({
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
          updateDto.outerBefore,
          existingRecord.outerBeforeId,
          updatePayload,
          'outerBeforeId',
        );

        await this.upsertGibsStage(
          tx,
          updateDto.outerData,
          existingRecord.outerDataId,
          updatePayload,
          'outerDataId',
        );

        await this.upsertGibsStage(
          tx,
          updateDto.outerFreeHangingData,
          existingRecord.outerFreeHangingDataId,
          updatePayload,
          'outerFreeHangingDataId',
        );

        await this.upsertGibsStage(
          tx,
          updateDto.innerBefore,
          existingRecord.innerBeforeId,
          updatePayload,
          'innerBeforeId',
        );

        await this.upsertGibsStage(
          tx,
          updateDto.innerData,
          existingRecord.innerDataId,
          updatePayload,
          'innerDataId',
        );

        await this.upsertGibsStage(
          tx,
          updateDto.innerBeforeTool,
          existingRecord.innerBeforeToolId,
          updatePayload,
          'innerBeforeToolId',
        );

        await this.upsertGibsStage(
          tx,
          updateDto.innerDataTool,
          existingRecord.innerDataToolId,
          updatePayload,
          'innerDataToolId',
        );

        if (updateDto.haveInnerGibsBeenAdjusted !== undefined) {
          updatePayload.haveInnerGibsBeenAdjusted =
            updateDto.haveInnerGibsBeenAdjusted;
        }

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

    // Generate GIBS alerts if outerData (after adjustment) was updated
    if (updateDto.outerData) {
      try {
        await this.alertsService.generateAlertsForGibs(serviceId);
      } catch (error) {
        console.error('Error generating GIBS alerts:', error);
      }
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

    // Generate clutch alerts
    try {
      await this.alertsService.generateClutchAlertsForService(serviceId);
    } catch (error) {
      console.error('Error generating clutch alerts:', error);
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

    // DTO data now matches Prisma schema directly (fields like topTop, bottomTop, etc.)
    const outerPrismaData = updateDto.outerData || null;
    const innerPrismaData = updateDto.innerData || null;

    if (existingRecord) {
      await this.prisma.$transaction(async (tx) => {
        const updatePayload: any = {};

        if (outerPrismaData) {
          if (existingRecord.outerDataId) {
            await tx.trammingData.update({
              where: { id: existingRecord.outerDataId },
              data: outerPrismaData as any,
            });
          } else {
            const created = await tx.trammingData.create({
              data: outerPrismaData as any,
            });
            updatePayload.outerDataId = created.id;
          }
        }

        if (innerPrismaData) {
          if (existingRecord.innerDataId) {
            await tx.trammingData.update({
              where: { id: existingRecord.innerDataId },
              data: innerPrismaData as any,
            });
          } else {
            const created = await tx.trammingData.create({
              data: innerPrismaData as any,
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
              ...(outerPrismaData && {
                outerData: { create: outerPrismaData as any },
              }),
              ...(innerPrismaData && {
                innerData: { create: innerPrismaData as any },
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

    // DTO data now matches Prisma schema directly (fields like lhTop, rhTop, etc.)
    const outerPrismaData = updateDto.outerData || null;
    const innerPrismaData = updateDto.innerData || null;

    if (existingRecord) {
      await this.prisma.$transaction(async (tx) => {
        const updatePayload: any = {};

        if (outerPrismaData) {
          if (existingRecord.outerDataId) {
            await tx.pistonsData.update({
              where: { id: existingRecord.outerDataId },
              data: outerPrismaData as any,
            });
          } else {
            const created = await tx.pistonsData.create({
              data: outerPrismaData as any,
            });
            updatePayload.outerDataId = created.id;
          }
        }

        if (innerPrismaData) {
          if (existingRecord.innerDataId) {
            await tx.pistonsData.update({
              where: { id: existingRecord.innerDataId },
              data: innerPrismaData as any,
            });
          } else {
            const created = await tx.pistonsData.create({
              data: innerPrismaData as any,
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

    // Generate all alerts for completed service
    const completedSectionsList = updatedService.completedSections as string[];

    if (completedSectionsList.includes('BEARING_CLEARANCE')) {
      this.alertsService.generateAlertsForService(serviceId).catch((error) => {
        console.error('Error generating bearing clearance alerts:', error);
      });
    }

    if (completedSectionsList.includes('CLUTCH')) {
      this.alertsService
        .generateClutchAlertsForService(serviceId)
        .catch((error) => {
          console.error('Error generating clutch alerts:', error);
        });
    }

    if (completedSectionsList.includes('SLIDE')) {
      this.alertsService.generateAlertsForSlide(serviceId).catch((error) => {
        console.error('Error generating slide alerts:', error);
      });
    }

    if (completedSectionsList.includes('GIBS')) {
      this.alertsService.generateAlertsForGibs(serviceId).catch((error) => {
        console.error('Error generating GIBS alerts:', error);
      });
    }

    if (completedSectionsList.includes('PISTONS')) {
      this.alertsService.generateAlertsForPistons(serviceId).catch((error) => {
        console.error('Error generating PISTONS alerts:', error);
      });
    }

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

  async getAlertsSummary(serviceId: string): Promise<AlertsSummaryResponseDto> {
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: {
        alertBearingClearance: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertClutch: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertSlide: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertGibs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertPistons: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertCounterbalanceCylinderAirbag: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const sections: SectionAlertDto[] = [];
    let highestSeverity: AlertSeverityDto = 'NONE';
    let alertCount = 0;

    const updateHighestSeverity = (severity: AlertSeverityDto) => {
      if (severity === 'RED') {
        highestSeverity = 'RED';
      } else if (severity === 'YELLOW' && highestSeverity !== 'RED') {
        highestSeverity = 'YELLOW';
      } else if (severity === 'GREEN' && highestSeverity === 'NONE') {
        highestSeverity = 'GREEN';
      }
    };

    if (
      service.alertBearingClearance &&
      service.alertBearingClearance.length > 0
    ) {
      const alert = service.alertBearingClearance[0];
      const alerts: AlertDetailDto[] = [];
      let sectionSeverity: AlertSeverityDto = 'NONE';

      const bcFields = [
        {
          field: 'outer_totalClearance',
          label: 'Total Clearance (Outer)',
          severity: alert.outer_totalClearance_severity as AlertSeverityDto,
          value: alert.outer_totalClearance_differential?.toString() || '0',
        },
        {
          field: 'outer_mainBearings',
          label: 'Main Bearings (Outer)',
          severity: alert.outer_mainBearings_severity as AlertSeverityDto,
          value: alert.outer_mainBearings_differential?.toString() || '0',
        },
        {
          field: 'outer_upperConnectionBearings',
          label: 'Upper Connection Bearings (Outer)',
          severity:
            alert.outer_upperConnectionBearings_severity as AlertSeverityDto,
          value:
            alert.outer_upperConnectionBearings_differential?.toString() || '0',
        },
        {
          field: 'outer_wristPinToMatingPart',
          label: 'Wrist Pin to Mating Part (Outer)',
          severity:
            alert.outer_wristPinToMatingPart_severity as AlertSeverityDto,
          value:
            alert.outer_wristPinToMatingPart_differential?.toString() || '0',
        },
        {
          field: 'outer_wristPinToBushing',
          label: 'Wrist Pin to Bushing (Outer)',
          severity: alert.outer_wristPinToBushing_severity as AlertSeverityDto,
          value: alert.outer_wristPinToBushing_differential?.toString() || '0',
        },
        {
          field: 'outer_slideAdjNutToScrewSleeve',
          label: 'Slide Adj Nut to Screw Sleeve (Outer)',
          severity:
            alert.outer_slideAdjNutToScrewSleeve_severity as AlertSeverityDto,
          value:
            alert.outer_slideAdjNutToScrewSleeve_differential?.toString() ||
            '0',
        },
        {
          field: 'inner_totalClearance',
          label: 'Total Clearance (Inner)',
          severity: alert.inner_totalClearance_severity as AlertSeverityDto,
          value: alert.inner_totalClearance_differential?.toString() || '0',
        },
        {
          field: 'inner_mainBearings',
          label: 'Main Bearings (Inner)',
          severity: alert.inner_mainBearings_severity as AlertSeverityDto,
          value: alert.inner_mainBearings_differential?.toString() || '0',
        },
        {
          field: 'inner_upperConnectionBearings',
          label: 'Upper Connection Bearings (Inner)',
          severity:
            alert.inner_upperConnectionBearings_severity as AlertSeverityDto,
          value:
            alert.inner_upperConnectionBearings_differential?.toString() || '0',
        },
        {
          field: 'inner_wristPinToMatingPart',
          label: 'Wrist Pin to Mating Part (Inner)',
          severity:
            alert.inner_wristPinToMatingPart_severity as AlertSeverityDto,
          value:
            alert.inner_wristPinToMatingPart_differential?.toString() || '0',
        },
        {
          field: 'inner_wristPinToBushing',
          label: 'Wrist Pin to Bushing (Inner)',
          severity: alert.inner_wristPinToBushing_severity as AlertSeverityDto,
          value: alert.inner_wristPinToBushing_differential?.toString() || '0',
        },
        {
          field: 'inner_slideAdjNutToScrewSleeve',
          label: 'Slide Adj Nut to Screw Sleeve (Inner)',
          severity:
            alert.inner_slideAdjNutToScrewSleeve_severity as AlertSeverityDto,
          value:
            alert.inner_slideAdjNutToScrewSleeve_differential?.toString() ||
            '0',
        },
      ];

      for (const f of bcFields) {
        if (f.severity === 'YELLOW' || f.severity === 'RED') {
          alerts.push({
            field: f.field,
            fieldLabel: f.label,
            value: f.value,
            severity: f.severity,
          });
          alertCount++;
          if (f.severity === 'RED') sectionSeverity = 'RED';
          else if (f.severity === 'YELLOW' && sectionSeverity !== 'RED')
            sectionSeverity = 'YELLOW';
        }
      }

      if (alerts.length > 0) {
        sections.push({
          sectionKey: 'BEARING_CLEARANCE',
          sectionName: 'Bearing Clearance',
          severity: sectionSeverity,
          alerts,
        });
        updateHighestSeverity(sectionSeverity);
      }
    }

    // Process Clutch alerts
    if (service.alertClutch && service.alertClutch.length > 0) {
      const alert = service.alertClutch[0];
      const alerts: AlertDetailDto[] = [];
      let sectionSeverity: AlertSeverityDto = 'NONE';

      const clutchFields = [
        {
          field: 'hydClutchClearanceTotal',
          label: 'Hyd Clutch Clearance Total',
          severity: alert.hydClutchClearanceTotal_severity as AlertSeverityDto,
          value: alert.hydClutchClearanceTotal_value?.toString() || '0',
        },
        {
          field: 'hydClutchClearanceRear',
          label: 'Hyd Clutch Clearance Rear',
          severity: alert.hydClutchClearanceRear_severity as AlertSeverityDto,
          value: alert.hydClutchClearanceRear_value?.toString() || '0',
        },
        {
          field: 'fb',
          label: 'F-B (Front-Back)',
          severity: alert.fb_severity as AlertSeverityDto,
          value: alert.fb_value?.toString() || '0',
        },
        {
          field: 'fTB',
          label: 'F-TB (Front Top-Bottom)',
          severity: alert.fTB_severity as AlertSeverityDto,
          value: alert.fTB_value?.toString() || '0',
        },
        {
          field: 'rTB',
          label: 'R-TB (Rear Top-Bottom)',
          severity: alert.rTB_severity as AlertSeverityDto,
          value: alert.rTB_value?.toString() || '0',
        },
      ];

      for (const f of clutchFields) {
        if (f.severity === 'YELLOW' || f.severity === 'RED') {
          alerts.push({
            field: f.field,
            fieldLabel: f.label,
            value: f.value,
            severity: f.severity,
          });
          alertCount++;
          if (f.severity === 'RED') sectionSeverity = 'RED';
          else if (f.severity === 'YELLOW' && sectionSeverity !== 'RED')
            sectionSeverity = 'YELLOW';
        }
      }

      if (alerts.length > 0) {
        sections.push({
          sectionKey: 'CLUTCH',
          sectionName: 'Clutch',
          severity: sectionSeverity,
          alerts,
        });
        updateHighestSeverity(sectionSeverity);
      }
    }

    // Process Slide alerts
    if (service.alertSlide && service.alertSlide.length > 0) {
      const alert = service.alertSlide[0];
      const alerts: AlertDetailDto[] = [];
      let sectionSeverity: AlertSeverityDto = 'NONE';

      const slideFields = [
        {
          field: 'maxDeviationOuter',
          label: 'Max Deviation (Outer)',
          severity: alert.maxDeviationOuter_severity as AlertSeverityDto,
          value: alert.maxDeviationOuter_differential?.toString() || '0',
        },
        {
          field: 'maxDeviationInner',
          label: 'Max Deviation (Inner)',
          severity: alert.maxDeviationInner_severity as AlertSeverityDto,
          value: alert.maxDeviationInner_differential?.toString() || '0',
        },
      ];

      for (const f of slideFields) {
        if (f.severity === 'YELLOW' || f.severity === 'RED') {
          alerts.push({
            field: f.field,
            fieldLabel: f.label,
            value: f.value,
            severity: f.severity,
          });
          alertCount++;
          if (f.severity === 'RED') sectionSeverity = 'RED';
          else if (f.severity === 'YELLOW' && sectionSeverity !== 'RED')
            sectionSeverity = 'YELLOW';
        }
      }

      if (alerts.length > 0) {
        sections.push({
          sectionKey: 'SLIDE',
          sectionName: 'Slide',
          severity: sectionSeverity,
          alerts,
        });
        updateHighestSeverity(sectionSeverity);
      }
    }

    // Process Gibs alerts
    if (service.alertGibs && service.alertGibs.length > 0) {
      const alert = service.alertGibs[0];
      const alerts: AlertDetailDto[] = [];
      let sectionSeverity: AlertSeverityDto = 'NONE';

      const severity = alert.usable_severity as AlertSeverityDto;
      if (severity === 'YELLOW' || severity === 'RED') {
        alerts.push({
          field: 'usable',
          fieldLabel: 'Usable',
          value: alert.usable_value?.toString() || '0',
          severity,
        });
        alertCount++;
        sectionSeverity = severity;
      }

      if (alerts.length > 0) {
        sections.push({
          sectionKey: 'GIBS',
          sectionName: 'Gibs',
          severity: sectionSeverity,
          alerts,
        });
        updateHighestSeverity(sectionSeverity);
      }
    }

    // Process Pistons alerts
    if (service.alertPistons && service.alertPistons.length > 0) {
      const alert = service.alertPistons[0];
      const alerts: AlertDetailDto[] = [];
      let sectionSeverity: AlertSeverityDto = 'NONE';

      const pistonsFields = [
        // Outer clearance severities
        {
          field: 'outer_lhTop',
          label: 'LH Top (Outer)',
          severity: alert.outer_lhTop_severity as AlertSeverityDto,
        },
        {
          field: 'outer_lhBottom',
          label: 'LH Bottom (Outer)',
          severity: alert.outer_lhBottom_severity as AlertSeverityDto,
        },
        {
          field: 'outer_lhLeft',
          label: 'LH Left (Outer)',
          severity: alert.outer_lhLeft_severity as AlertSeverityDto,
        },
        {
          field: 'outer_lhRight',
          label: 'LH Right (Outer)',
          severity: alert.outer_lhRight_severity as AlertSeverityDto,
        },
        {
          field: 'outer_rhTop',
          label: 'RH Top (Outer)',
          severity: alert.outer_rhTop_severity as AlertSeverityDto,
        },
        {
          field: 'outer_rhBottom',
          label: 'RH Bottom (Outer)',
          severity: alert.outer_rhBottom_severity as AlertSeverityDto,
        },
        {
          field: 'outer_rhLeft',
          label: 'RH Left (Outer)',
          severity: alert.outer_rhLeft_severity as AlertSeverityDto,
        },
        {
          field: 'outer_rhRight',
          label: 'RH Right (Outer)',
          severity: alert.outer_rhRight_severity as AlertSeverityDto,
        },
        // Outer difference severities
        {
          field: 'outer_lhLeftRight',
          label: 'LH Left-Right Diff (Outer)',
          severity: alert.outer_lhLeftRight_severity as AlertSeverityDto,
          value: alert.outer_lhLeftRight_diff?.toString(),
        },
        {
          field: 'outer_lhTopBottom',
          label: 'LH Top-Bottom Diff (Outer)',
          severity: alert.outer_lhTopBottom_severity as AlertSeverityDto,
          value: alert.outer_lhTopBottom_diff?.toString(),
        },
        {
          field: 'outer_rhLeftRight',
          label: 'RH Left-Right Diff (Outer)',
          severity: alert.outer_rhLeftRight_severity as AlertSeverityDto,
          value: alert.outer_rhLeftRight_diff?.toString(),
        },
        {
          field: 'outer_rhTopBottom',
          label: 'RH Top-Bottom Diff (Outer)',
          severity: alert.outer_rhTopBottom_severity as AlertSeverityDto,
          value: alert.outer_rhTopBottom_diff?.toString(),
        },
        // Inner clearance severities
        {
          field: 'inner_lhTop',
          label: 'LH Top (Inner)',
          severity: alert.inner_lhTop_severity as AlertSeverityDto,
        },
        {
          field: 'inner_lhBottom',
          label: 'LH Bottom (Inner)',
          severity: alert.inner_lhBottom_severity as AlertSeverityDto,
        },
        {
          field: 'inner_lhLeft',
          label: 'LH Left (Inner)',
          severity: alert.inner_lhLeft_severity as AlertSeverityDto,
        },
        {
          field: 'inner_lhRight',
          label: 'LH Right (Inner)',
          severity: alert.inner_lhRight_severity as AlertSeverityDto,
        },
        {
          field: 'inner_rhTop',
          label: 'RH Top (Inner)',
          severity: alert.inner_rhTop_severity as AlertSeverityDto,
        },
        {
          field: 'inner_rhBottom',
          label: 'RH Bottom (Inner)',
          severity: alert.inner_rhBottom_severity as AlertSeverityDto,
        },
        {
          field: 'inner_rhLeft',
          label: 'RH Left (Inner)',
          severity: alert.inner_rhLeft_severity as AlertSeverityDto,
        },
        {
          field: 'inner_rhRight',
          label: 'RH Right (Inner)',
          severity: alert.inner_rhRight_severity as AlertSeverityDto,
        },
        // Inner difference severities
        {
          field: 'inner_lhLeftRight',
          label: 'LH Left-Right Diff (Inner)',
          severity: alert.inner_lhLeftRight_severity as AlertSeverityDto,
          value: alert.inner_lhLeftRight_diff?.toString(),
        },
        {
          field: 'inner_lhTopBottom',
          label: 'LH Top-Bottom Diff (Inner)',
          severity: alert.inner_lhTopBottom_severity as AlertSeverityDto,
          value: alert.inner_lhTopBottom_diff?.toString(),
        },
        {
          field: 'inner_rhLeftRight',
          label: 'RH Left-Right Diff (Inner)',
          severity: alert.inner_rhLeftRight_severity as AlertSeverityDto,
          value: alert.inner_rhLeftRight_diff?.toString(),
        },
        {
          field: 'inner_rhTopBottom',
          label: 'RH Top-Bottom Diff (Inner)',
          severity: alert.inner_rhTopBottom_severity as AlertSeverityDto,
          value: alert.inner_rhTopBottom_diff?.toString(),
        },
      ];

      for (const f of pistonsFields) {
        if (f.severity === 'YELLOW' || f.severity === 'RED') {
          alerts.push({
            field: f.field,
            fieldLabel: f.label,
            value: f.value || '',
            severity: f.severity,
          });
          alertCount++;
          if (f.severity === 'RED') sectionSeverity = 'RED';
          else if (f.severity === 'YELLOW' && sectionSeverity !== 'RED')
            sectionSeverity = 'YELLOW';
        }
      }

      if (alerts.length > 0) {
        sections.push({
          sectionKey: 'PISTONS',
          sectionName: 'Pistons',
          severity: sectionSeverity,
          alerts,
        });
        updateHighestSeverity(sectionSeverity);
      }
    }

    // Process Counterbalance Cylinder Airbag alerts (these are always RED when present)
    if (
      service.alertCounterbalanceCylinderAirbag &&
      service.alertCounterbalanceCylinderAirbag.length > 0
    ) {
      const alerts: AlertDetailDto[] = [];

      for (const alert of service.alertCounterbalanceCylinderAirbag) {
        alerts.push({
          field: alert.fieldName,
          fieldLabel: alert.fieldName.replace(/_/g, ' '),
          value: alert.justification,
          severity: 'RED',
        });
        alertCount++;
      }

      if (alerts.length > 0) {
        sections.push({
          sectionKey: 'COUNTERBALANCE_CYLINDER',
          sectionName: 'Counterbalance Cylinder / Airbag',
          severity: 'RED',
          alerts,
        });
        updateHighestSeverity('RED');
      }
    }

    return {
      hasAlerts: alertCount > 0,
      alertCount,
      highestSeverity,
      sections,
    };
  }
}
