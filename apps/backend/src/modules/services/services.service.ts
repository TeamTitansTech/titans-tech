import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Prisma, ServiceRequestStatus } from '@titans-tech/db';
import { ServiceSection, ServiceStatus } from '@titans-tech/shared/enums';
import { PrismaService } from '../shared/prisma.service';
import {
  LatestReportResponseDto,
  LatestBearingClearanceDto,
  LatestClutchDto,
  LatestSlideSingleHammerDto,
  LatestSlideDoubleHammerDto,
  LatestGibsDto,
  LatestLubricationDto,
  LatestCounterbalanceDto,
  LatestPistonsDto,
  LatestTrammingDto,
  CreateServiceDto,
  UpdateServicePayload,
  CompleteServiceDto,
  BearingClearanceCheck,
  SlideSingleHammerCheck,
  SlideDoubleHammerCheck,
  GibsCheck,
  LubricationHydraulicsCheck,
  ClutchData,
  CounterbalanceCylinderCheck,
  TrammingCheck,
  PistonsCheck,
  ShimThicknessCheck,
  DieCushionCheck,
  AlertsSummaryResponseDto,
  SectionAlertDto,
  AlertDetailDto,
  AlertSeverityDto,
} from '@titans-tech/shared/backend-dtos';
import { AlertsService } from '../alerts/alerts.service';
import {
  hasPermissionInBranch,
  type UserWithBranchPermissions,
  type Permissions,
} from '@titans-tech/shared/types';
import {
  OIL_CHANGE_INTERVAL_DAYS,
  OIL_CHANGE_WARNING_THRESHOLD_DAYS,
} from './services.constants';

type ServicePermission =
  | 'createServices'
  | 'updateServices'
  | 'deleteServices'
  | 'readServices';

/**
 * Helper to convert GibsStageData with optional fields to Prisma-compatible format
 * Converts undefined numeric values to 0
 */
type GibsStageDataInput = {
  point1?: number;
  point2?: number;
  point3?: number;
  point4?: number;
  point5?: number;
  point6?: number;
  point7?: number;
  point8?: number;
  point9?: number;
  point10?: number;
  point11?: number;
  point12?: number;
  point13?: number;
  point14?: number;
  point15?: number;
  point16?: number;
};

function normalizeGibsStageData(data: GibsStageDataInput): {
  point1: number;
  point2: number;
  point3: number;
  point4: number;
  point5: number;
  point6: number;
  point7: number;
  point8: number;
  point9: number;
  point10: number;
  point11: number;
  point12: number;
  point13: number;
  point14: number;
  point15: number;
  point16: number;
} {
  return {
    point1: data.point1 ?? 0,
    point2: data.point2 ?? 0,
    point3: data.point3 ?? 0,
    point4: data.point4 ?? 0,
    point5: data.point5 ?? 0,
    point6: data.point6 ?? 0,
    point7: data.point7 ?? 0,
    point8: data.point8 ?? 0,
    point9: data.point9 ?? 0,
    point10: data.point10 ?? 0,
    point11: data.point11 ?? 0,
    point12: data.point12 ?? 0,
    point13: data.point13 ?? 0,
    point14: data.point14 ?? 0,
    point15: data.point15 ?? 0,
    point16: data.point16 ?? 0,
  };
}

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    private prisma: PrismaService,
    private alertsService: AlertsService,
  ) {}

  /**
   * Gets the list of branch IDs that a user has readServices permission for
   * @param userId - The ID of the user
   * @returns Array of branch IDs the user can read services from
   */
  private async getUserBranchIdsWithPermission(
    userId: string,
  ): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        branches: { where: { deletedAt: null } },
        company: {
          include: {
            branches: {
              where: { deletedAt: null },
              select: { id: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Company admins have access to all branches in their company
    if (user.isCompanyAdmin) {
      return user.company.branches.map((b) => b.id);
    }

    // For regular users, filter branches by readServices permission
    const userWithPermissions: UserWithBranchPermissions = {
      id: user.id,
      isCompanyAdmin: false,
      branches: user.branches.map((ub) => ({
        branchId: ub.branchId,
        ...(ub as unknown as Permissions),
      })),
    };

    // Filter branches where user has readServices permission (including prerequisites)
    const permittedBranchIds = user.branches
      .filter((ub) =>
        hasPermissionInBranch(userWithPermissions, ub.branchId, 'readServices'),
      )
      .map((ub) => ub.branchId);

    return permittedBranchIds;
  }

  /**
   * Validates if a user has permission to perform an action on a service
   * @param userId - The ID of the user making the request (null for SysAdmin)
   * @param machineId - The ID of the machine the service belongs to
   * @param permission - The permission to check
   */
  private async validateServicePermission(
    userId: string | null,
    machineId: string,
    permission: ServicePermission,
  ): Promise<void> {
    // SysAdmin has full access (userId is null when coming from SysAdmin)
    if (!userId) return;

    // 1. Get machine and its branch/company info
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
      select: { branchId: true, branch: { select: { companyId: true } } },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    // 2. Get user info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true, isCompanyAdmin: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // 3. Verify user belongs to the same company
    if (user.companyId !== machine.branch.companyId) {
      throw new ForbiddenException(
        'Access denied: User not part of this company',
      );
    }

    // 4. Company Admin has full access
    if (user.isCompanyAdmin) {
      return;
    }

    // 5. Check branch-specific permission
    const userBranch = await this.prisma.userBranch.findUnique({
      where: {
        userId_branchId: { userId, branchId: machine.branchId },
      },
    });

    if (!userBranch) {
      throw new ForbiddenException(
        'Access denied: User not part of this branch',
      );
    }

    if (!userBranch[permission]) {
      throw new ForbiddenException(
        `Access denied: Missing required permission '${permission}'`,
      );
    }
  }

  /**
   * Validates permission based on serviceId (fetches machineId internally)
   */
  private async validateServicePermissionByServiceId(
    userId: string | null,
    serviceId: string,
    permission: ServicePermission,
  ): Promise<string> {
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      select: { machineId: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    await this.validateServicePermission(userId, service.machineId, permission);

    return service.machineId;
  }

  async create(
    createInspectionDto: CreateServiceDto,
    userId: string | null,
  ): Promise<
    Prisma.MachineServiceGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true; branch: true } };
      };
    }>
  > {
    // Validate permission before creating
    await this.validateServicePermission(
      userId,
      createInspectionDto.machineId,
      'createServices',
    );

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

    // If this service was created from a service request, close the request
    if (createInspectionDto.serviceRequestId) {
      await this.prisma.serviceRequest.update({
        where: { id: createInspectionDto.serviceRequestId },
        data: {
          status: ServiceRequestStatus.CLOSED,
          closedAt: new Date(),
        },
      });
      this.logger.log(
        `Closed service request ${createInspectionDto.serviceRequestId} after creating service ${inspection.id}`,
      );
    }

    return inspection;
  }

  async update(
    serviceId: string,
    updateDto: UpdateServicePayload,
    userId: string | null,
  ): Promise<any> {
    // Verify service exists
    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      select: { id: true, machineId: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    // Validate permission before updating
    await this.validateServicePermission(
      userId,
      service.machineId,
      'updateServices',
    );

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
        slideSingleHammer: {
          include: {
            beforeData: true,
            data: true,
          },
        },
        slideDoubleHammer: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
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
        shimThickness: {
          include: {
            outerLhData: true,
            outerRhData: true,
            innerLhData: true,
            innerRhData: true,
          },
        },
        dieCushion: true,
        electricalControl: true,
      },
    });

    return updatedService;
  }

  async findAll(userId: string): Promise<any[]> {
    const branchIds = await this.getUserBranchIdsWithPermission(userId);

    return this.prisma.machineService.findMany({
      where: {
        machine: {
          branchId: {
            in: branchIds,
          },
        },
      },
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
        slideSingleHammer: {
          include: {
            beforeData: true,
            data: true,
          },
        },
        slideDoubleHammer: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
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
        shimThickness: {
          include: {
            outerLhData: true,
            outerRhData: true,
            innerLhData: true,
            innerRhData: true,
          },
        },
        dieCushion: true,
        electricalControl: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findAllForSysAdmin(): Promise<any[]> {
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
        slideSingleHammer: {
          include: {
            beforeData: true,
            data: true,
          },
        },
        slideDoubleHammer: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
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
        shimThickness: {
          include: {
            outerLhData: true,
            outerRhData: true,
            innerLhData: true,
            innerRhData: true,
          },
        },
        dieCushion: true,
        electricalControl: true,
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
        slideSingleHammer: {
          include: {
            beforeData: true,
            data: true,
          },
        },
        slideDoubleHammer: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
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
        shimThickness: {
          include: {
            outerLhData: true,
            outerRhData: true,
            innerLhData: true,
            innerRhData: true,
          },
        },
        dieCushion: true,
        electricalControl: true,
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
        slideSingleHammer: {
          include: {
            beforeData: true,
            data: true,
          },
        },
        slideDoubleHammer: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
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
        shimThickness: {
          include: {
            outerLhData: true,
            outerRhData: true,
            innerLhData: true,
            innerRhData: true,
          },
        },
        dieCushion: true,
        electricalControl: true,
        // Include alert entities for status display
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
        alertSlideSingleHammer: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertSlideDoubleHammer: {
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
        alertCounterbalanceCylinderAirbag: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertTramming: {
          orderBy: { createdAt: 'desc' },
          take: 1,
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

    // 2. Fetch only COMPLETED services for this machine, ordered by date DESC
    // PENDING services should not affect the machine's status/alerts
    const services: any[] = await this.prisma.machineService.findMany({
      where: { machineId, status: ServiceStatus.COMPLETED },
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
        slideSingleHammer: {
          include: {
            beforeData: true,
            data: true,
          },
        },
        slideDoubleHammer: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
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
        shimThickness: {
          include: {
            outerLhData: true,
            outerRhData: true,
            innerLhData: true,
            innerRhData: true,
          },
        },
        dieCushion: true,
        electricalControl: true,
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

    // 5. Process Slide sections (single and double hammer are COMPLETELY SEPARATE)
    let slideSingleHammerData: LatestSlideSingleHammerDto | null = null;
    let slideDoubleHammerData: LatestSlideDoubleHammerDto | null = null;

    const hasSlideSingleHammer = machine.blueprint.sections.includes(
      ServiceSection.SLIDE_SINGLE_HAMMER,
    );
    const hasSlideDoubleHammer = machine.blueprint.sections.includes(
      ServiceSection.SLIDE_DOUBLE_HAMMER,
    );

    if (hasSlideSingleHammer) {
      // Find the most recent service with Single Hammer Slide data
      const latestSlideService = services.find(
        (service) =>
          service.slideSingleHammer && service.slideSingleHammer.length > 0,
      );

      if (latestSlideService) {
        const slideRecord = latestSlideService.slideSingleHammer[0];

        if (slideRecord) {
          // Try to fetch alert for this service
          let alert = undefined;
          try {
            alert = await this.alertsService.getSlideSingleHammerAlertByService(
              latestSlideService.id,
            );
          } catch {
            // Alert might not exist, that's fine
          }

          slideSingleHammerData = new LatestSlideSingleHammerDto({
            latestServiceId: latestSlideService.id,
            latestServiceDate: latestSlideService.date,
            serviceType: latestSlideService.type,
            data: {
              beforeData: slideRecord.beforeData,
              data: slideRecord.data,
            },
            alert: alert || undefined,
          });
        }
      }
    }

    if (hasSlideDoubleHammer) {
      // Find the most recent service with Double Hammer Slide data
      const latestSlideService = services.find(
        (service) =>
          service.slideDoubleHammer && service.slideDoubleHammer.length > 0,
      );

      if (latestSlideService) {
        const slideRecord = latestSlideService.slideDoubleHammer[0];

        if (slideRecord) {
          // Try to fetch alert for this service
          let alert = undefined;
          try {
            alert = await this.alertsService.getSlideDoubleHammerAlertByService(
              latestSlideService.id,
            );
          } catch {
            // Alert might not exist, that's fine
          }

          slideDoubleHammerData = new LatestSlideDoubleHammerDto({
            latestServiceId: latestSlideService.id,
            latestServiceDate: latestSlideService.date,
            serviceType: latestSlideService.type,
            data: {
              outerBefore: slideRecord.outerBefore,
              outerData: slideRecord.outerData,
              innerBefore: slideRecord.innerBefore,
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
              outerData: outerData || undefined,
              innerData: innerData || undefined,
              notes: pistonsRecord.notes,
            },
            alert: alert || undefined,
          });
        }
      }
    }

    // 10. Process Tramming section
    let trammingData: LatestTrammingDto | null = null;

    if (machine.blueprint.sections.includes(ServiceSection.TRAMMING)) {
      // Find the most recent service with Tramming data
      const latestTrammingService = services.find(
        (service) => service.tramming && service.tramming.length > 0,
      );

      if (latestTrammingService) {
        const trammingRecord = latestTrammingService.tramming[0];

        if (trammingRecord) {
          // Try to fetch alert for this service
          let alert = undefined;
          try {
            alert = await this.alertsService.getTrammingAlertsByService(
              latestTrammingService.id,
            );
          } catch {
            // Alert might not exist, that's fine
          }

          trammingData = new LatestTrammingDto({
            latestServiceId: latestTrammingService.id,
            latestServiceDate: latestTrammingService.date,
            serviceType: latestTrammingService.type,
            data: {
              outerData: trammingRecord.outerData || undefined,
              innerData: trammingRecord.innerData || undefined,
            },
            alert: alert || undefined,
          });
        }
      }
    }

    // 11. Build response
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
        SLIDE_SINGLE_HAMMER: slideSingleHammerData,
        SLIDE_DOUBLE_HAMMER: slideDoubleHammerData,
        GIBS: gibsData,
        PISTONS: pistonsData,
        LUBRICATION_HYDRAULICS_PRESSURE_SWITCHES_OIL_FILTER: lubricationData,
        CLUTCH: clutchData,
        COUNTERBALANCE_CYLINDER_AIRBAG: counterbalanceData,
        TRAMMING: trammingData,
      },
    });
  }

  // Section Update Methods

  async updateBearingClearance(
    serviceId: string,
    updateDto: BearingClearanceCheck,
    userId: string | null,
  ): Promise<any> {
    // Validate permission before updating
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

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

    // Note: Alerts are generated only when service is completed via completeService()
    return this.findOne(serviceId);
  }

  async updateSlideSingleHammer(
    serviceId: string,
    updateDto: SlideSingleHammerCheck,
    userId: string | null,
  ): Promise<any> {
    // Validate permission before updating
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { slideSingleHammer: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes(
      'SLIDE_SINGLE_HAMMER',
    )
      ? completedSections
      : [...completedSections, 'SLIDE_SINGLE_HAMMER'];

    await this.prisma.$transaction(async (tx) => {
      const existingRecord = service.slideSingleHammer?.[0];

      // Helper function to upsert nested slide data
      const upsertData = async (
        data: any,
        existingId: string | null | undefined,
      ) => {
        if (!data) return existingId;

        if (existingId) {
          await tx.slideSingleHammerData.update({
            where: { id: existingId },
            data: data as any,
          });
          return existingId;
        } else {
          const created = await tx.slideSingleHammerData.create({
            data: data as any,
          });
          return created.id;
        }
      };

      if (existingRecord) {
        // Update existing single hammer slide record
        const beforeDataId = await upsertData(
          updateDto.beforeData,
          existingRecord.beforeDataId,
        );
        const dataId = await upsertData(updateDto.data, existingRecord.dataId);

        // Build update payload with IDs and notes
        const updatePayload: any = {
          ...(beforeDataId && { beforeDataId }),
          ...(dataId && { dataId }),
          ...(updateDto.notes !== undefined && { notes: updateDto.notes }),
        };

        await tx.machineServiceSlideSingleHammer.update({
          where: { id: existingRecord.id },
          data: updatePayload,
        });
      } else {
        // Create new single hammer slide record
        const { beforeData, data, notes } = updateDto;

        await tx.machineServiceSlideSingleHammer.create({
          data: {
            machineService: { connect: { id: serviceId } },
            ...(beforeData && {
              beforeData: { create: beforeData as any },
            }),
            ...(data && {
              data: { create: data as any },
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

    if (updateDto.data) {
      try {
        await this.alertsService.generateAlertsForSlideSingleHammer(serviceId);
      } catch (error) {
        console.error('Error generating slide single hammer alerts:', error);
      }
    }

    return this.findOne(serviceId);
  }

  async updateSlideDoubleHammer(
    serviceId: string,
    updateDto: SlideDoubleHammerCheck,
    userId: string | null,
  ): Promise<any> {
    // Validate permission before updating
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { slideDoubleHammer: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes(
      'SLIDE_DOUBLE_HAMMER',
    )
      ? completedSections
      : [...completedSections, 'SLIDE_DOUBLE_HAMMER'];

    await this.prisma.$transaction(async (tx) => {
      const existingRecord = service.slideDoubleHammer?.[0];

      // Helper function to upsert nested slide data
      const upsertData = async (
        data: any,
        existingId: string | null | undefined,
      ) => {
        if (!data) return existingId;

        if (existingId) {
          await tx.slideDoubleHammerData.update({
            where: { id: existingId },
            data: data as any,
          });
          return existingId;
        } else {
          const created = await tx.slideDoubleHammerData.create({
            data: data as any,
          });
          return created.id;
        }
      };

      if (existingRecord) {
        // Update existing double hammer slide record (with 4 possible FKs for inner/outer before/after)
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

        await tx.machineServiceSlideDoubleHammer.update({
          where: { id: existingRecord.id },
          data: updatePayload,
        });
      } else {
        // Create new double hammer slide record with 4 possible SlideData records
        const { outerBefore, outerData, innerBefore, innerData, notes } =
          updateDto;

        await tx.machineServiceSlideDoubleHammer.create({
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

    // Note: Alerts are generated only when service is completed via completeService()
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

    // Normalize data to ensure all point fields are numbers (not undefined)
    const normalizedData = normalizeGibsStageData(stageData);

    if (existingId) {
      await tx.gibsStageData.update({
        where: { id: existingId },
        data: normalizedData,
      });
    } else {
      const created = await tx.gibsStageData.create({
        data: normalizedData,
      });
      updatePayload[fieldName] = created.id;
    }
  }

  async updateGibs(
    serviceId: string,
    updateDto: GibsCheck,
    userId: string | null,
  ): Promise<any> {
    // Validate permission before updating
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

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
                  create: normalizeGibsStageData(updateDto.outerBefore),
                },
              }),
              ...(updateDto.outerData && {
                outerData: {
                  create: normalizeGibsStageData(updateDto.outerData),
                },
              }),
              ...(updateDto.outerFreeHangingData && {
                outerFreeHangingData: {
                  create: normalizeGibsStageData(
                    updateDto.outerFreeHangingData,
                  ),
                },
              }),
              ...(updateDto.haveInnerGibsBeenAdjusted && {
                haveInnerGibsBeenAdjusted: updateDto.haveInnerGibsBeenAdjusted,
              }),
              ...(updateDto.innerBefore && {
                innerBefore: {
                  create: normalizeGibsStageData(updateDto.innerBefore),
                },
              }),
              ...(updateDto.innerData && {
                innerData: {
                  create: normalizeGibsStageData(updateDto.innerData),
                },
              }),
              ...(updateDto.innerBeforeTool && {
                innerBeforeTool: {
                  create: normalizeGibsStageData(updateDto.innerBeforeTool),
                },
              }),
              ...(updateDto.innerDataTool && {
                innerDataTool: {
                  create: normalizeGibsStageData(updateDto.innerDataTool),
                },
              }),
              ...(updateDto.notes && { notes: updateDto.notes }),
            },
          },
        },
      });
    }

    // Note: Alerts are generated only when service is completed via completeService()
    return this.findOne(serviceId);
  }

  async updateLubricationHydraulics(
    serviceId: string,
    updateDto: LubricationHydraulicsCheck,
    userId: string | null,
  ): Promise<any> {
    // Validate permission before updating
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

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

  async updateClutch(
    serviceId: string,
    updateDto: ClutchData,
    userId: string | null,
  ): Promise<any> {
    // Validate permission before updating
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

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

    // Note: Alerts are generated only when service is completed via completeService()
    return this.findOne(serviceId);
  }

  async updateCounterbalanceCylinder(
    serviceId: string,
    updateDto: CounterbalanceCylinderCheck,
    userId: string | null,
  ): Promise<any> {
    // Validate permission before updating
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

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
    userId: string | null,
  ): Promise<any> {
    // Validate permission before updating
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

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

    // Note: Alerts are generated only when service is completed via completeService()
    return this.findOne(serviceId);
  }

  async updatePistons(
    serviceId: string,
    updateDto: PistonsCheck,
    userId: string | null,
  ): Promise<any> {
    // Validate permission before updating
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

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
              ...(updateDto.notes && { notes: updateDto.notes }),
            },
          },
        },
      });
    }

    return this.findOne(serviceId);
  }

  async updateShimThickness(
    serviceId: string,
    updateDto: ShimThicknessCheck,
    userId: string | null,
  ): Promise<any> {
    // Validate permission before updating
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { shimThickness: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes(
      'SHIM_THICKNESS',
    )
      ? completedSections
      : [...completedSections, 'SHIM_THICKNESS'];

    const existingRecord = service.shimThickness?.[0];

    const outerLhPrismaData = updateDto.outerLhData || null;
    const outerRhPrismaData = updateDto.outerRhData || null;
    const innerLhPrismaData = updateDto.innerLhData || null;
    const innerRhPrismaData = updateDto.innerRhData || null;

    if (existingRecord) {
      await this.prisma.$transaction(async (tx) => {
        const updatePayload: any = {};

        // Outer LH
        if (outerLhPrismaData) {
          if (existingRecord.outerLhDataId) {
            await tx.shimThicknessData.update({
              where: { id: existingRecord.outerLhDataId },
              data: outerLhPrismaData as any,
            });
          } else {
            const created = await tx.shimThicknessData.create({
              data: outerLhPrismaData as any,
            });
            updatePayload.outerLhDataId = created.id;
          }
        }

        // Outer RH
        if (outerRhPrismaData) {
          if (existingRecord.outerRhDataId) {
            await tx.shimThicknessData.update({
              where: { id: existingRecord.outerRhDataId },
              data: outerRhPrismaData as any,
            });
          } else {
            const created = await tx.shimThicknessData.create({
              data: outerRhPrismaData as any,
            });
            updatePayload.outerRhDataId = created.id;
          }
        }

        // Inner LH
        if (innerLhPrismaData) {
          if (existingRecord.innerLhDataId) {
            await tx.shimThicknessData.update({
              where: { id: existingRecord.innerLhDataId },
              data: innerLhPrismaData as any,
            });
          } else {
            const created = await tx.shimThicknessData.create({
              data: innerLhPrismaData as any,
            });
            updatePayload.innerLhDataId = created.id;
          }
        }

        // Inner RH
        if (innerRhPrismaData) {
          if (existingRecord.innerRhDataId) {
            await tx.shimThicknessData.update({
              where: { id: existingRecord.innerRhDataId },
              data: innerRhPrismaData as any,
            });
          } else {
            const created = await tx.shimThicknessData.create({
              data: innerRhPrismaData as any,
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
      await this.prisma.machineService.update({
        where: { id: serviceId },
        data: {
          completedSections: updatedCompletedSections,
          lastSectionSavedAt: new Date(),
          shimThickness: {
            create: {
              ...(outerLhPrismaData && {
                outerLhData: { create: outerLhPrismaData as any },
              }),
              ...(outerRhPrismaData && {
                outerRhData: { create: outerRhPrismaData as any },
              }),
              ...(innerLhPrismaData && {
                innerLhData: { create: innerLhPrismaData as any },
              }),
              ...(innerRhPrismaData && {
                innerRhData: { create: innerRhPrismaData as any },
              }),
              ...(updateDto.notes && { notes: updateDto.notes }),
            },
          },
        },
      });
    }

    return this.findOne(serviceId);
  }

  async updateDieCushion(
    serviceId: string,
    updateDto: DieCushionCheck,
    userId: string | null,
  ): Promise<any> {
    // Validate permission before updating
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { dieCushion: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes('DIE_CUSHION')
      ? completedSections
      : [...completedSections, 'DIE_CUSHION'];

    const existingRecord = service.dieCushion?.[0];

    if (existingRecord) {
      await this.prisma.$transaction(async (tx) => {
        await tx.machineServiceDieCushion.update({
          where: { id: existingRecord.id },
          data: {
            airLeaks: updateDto.airLeaks,
            airLeaksLocation: updateDto.airLeaksLocation,
            pneumaticsPlumbing: updateDto.pneumaticsPlumbing,
            lubrication: updateDto.lubrication,
            notes: updateDto.notes,
          },
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
      await this.prisma.machineService.update({
        where: { id: serviceId },
        data: {
          completedSections: updatedCompletedSections,
          lastSectionSavedAt: new Date(),
          dieCushion: {
            create: {
              airLeaks: updateDto.airLeaks,
              airLeaksLocation: updateDto.airLeaksLocation,
              pneumaticsPlumbing: updateDto.pneumaticsPlumbing,
              lubrication: updateDto.lubrication,
              notes: updateDto.notes,
            },
          },
        },
      });
    }

    return this.findOne(serviceId);
  }

  async updateElectricalControl(
    serviceId: string,
    updateDto: {
      hasHourMeter?: string;
      hourMeterReading?: string;
      isMinsterControl?: string;
      minsterControlOther?: string;
      controlDoorStop?: string;
      cabinetTemp?: string;
      incomingLine?: string;
      fullVoltage?: string;
      contactor?: string;
      overloads?: string;
      transformers?: string;
      brakeValve?: string;
      clutchValve?: string;
      wiring?: string;
      terminals?: string;
      twentyFourVBuss?: string;
      safetyRelays?: string;
      notes?: string;
    },
    userId: string | null,
  ): Promise<any> {
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { electricalControl: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes(
      'ELECTRICAL_CONTROL',
    )
      ? completedSections
      : [...completedSections, 'ELECTRICAL_CONTROL'];

    const existingRecord = service.electricalControl?.[0];

    if (existingRecord) {
      await this.prisma.$transaction(async (tx) => {
        await tx.machineServiceElectricalControl.update({
          where: { id: existingRecord.id },
          data: {
            hasHourMeter: updateDto.hasHourMeter as any,
            hourMeterReading: updateDto.hourMeterReading,
            isMinsterControl: updateDto.isMinsterControl as any,
            minsterControlOther: updateDto.minsterControlOther,
            controlDoorStop: updateDto.controlDoorStop as any,
            cabinetTemp: updateDto.cabinetTemp as any,
            incomingLine: updateDto.incomingLine as any,
            fullVoltage: updateDto.fullVoltage as any,
            contactor: updateDto.contactor as any,
            overloads: updateDto.overloads as any,
            transformers: updateDto.transformers as any,
            brakeValve: updateDto.brakeValve as any,
            clutchValve: updateDto.clutchValve as any,
            wiring: updateDto.wiring as any,
            terminals: updateDto.terminals as any,
            twentyFourVBuss: updateDto.twentyFourVBuss as any,
            safetyRelays: updateDto.safetyRelays as any,
            notes: updateDto.notes,
          },
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
      await this.prisma.machineService.update({
        where: { id: serviceId },
        data: {
          completedSections: updatedCompletedSections,
          lastSectionSavedAt: new Date(),
          electricalControl: {
            create: {
              hasHourMeter: updateDto.hasHourMeter as any,
              hourMeterReading: updateDto.hourMeterReading,
              isMinsterControl: updateDto.isMinsterControl as any,
              minsterControlOther: updateDto.minsterControlOther,
              controlDoorStop: updateDto.controlDoorStop as any,
              cabinetTemp: updateDto.cabinetTemp as any,
              incomingLine: updateDto.incomingLine as any,
              fullVoltage: updateDto.fullVoltage as any,
              contactor: updateDto.contactor as any,
              overloads: updateDto.overloads as any,
              transformers: updateDto.transformers as any,
              brakeValve: updateDto.brakeValve as any,
              clutchValve: updateDto.clutchValve as any,
              wiring: updateDto.wiring as any,
              terminals: updateDto.terminals as any,
              twentyFourVBuss: updateDto.twentyFourVBuss as any,
              safetyRelays: updateDto.safetyRelays as any,
              notes: updateDto.notes,
            },
          },
        },
      });
    }

    return this.findOne(serviceId);
  }

  async updatePerpendicularity(
    serviceId: string,
    updateDto: {
      hasBeenAdjusted?: string;
      beforeFR?: number | string;
      beforeLR?: number | string;
      afterFR?: number | string;
      afterLR?: number | string;
      notes?: string;
    },
    userId: string | null,
  ): Promise<any> {
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

    const service = await this.prisma.machineService.findUnique({
      where: { id: serviceId },
      include: { perpendicularity: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const completedSections = Array.isArray(service.completedSections)
      ? service.completedSections
      : [];

    const updatedCompletedSections = completedSections.includes(
      'PERPENDICULARITY',
    )
      ? completedSections
      : [...completedSections, 'PERPENDICULARITY'];

    const existingRecord = service.perpendicularity?.[0];

    // Convert string values to Decimal
    const toDecimal = (value: number | string | undefined) => {
      if (value === undefined || value === null || value === '')
        return undefined;
      return typeof value === 'string' ? parseFloat(value) : value;
    };

    if (existingRecord) {
      await this.prisma.$transaction(async (tx) => {
        await tx.machineServicePerpendicularity.update({
          where: { id: existingRecord.id },
          data: {
            hasBeenAdjusted: updateDto.hasBeenAdjusted as any,
            beforeFR: toDecimal(updateDto.beforeFR),
            beforeLR: toDecimal(updateDto.beforeLR),
            afterFR: toDecimal(updateDto.afterFR),
            afterLR: toDecimal(updateDto.afterLR),
            notes: updateDto.notes,
          },
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
      await this.prisma.machineService.update({
        where: { id: serviceId },
        data: {
          completedSections: updatedCompletedSections,
          lastSectionSavedAt: new Date(),
          perpendicularity: {
            create: {
              hasBeenAdjusted: updateDto.hasBeenAdjusted as any,
              beforeFR: toDecimal(updateDto.beforeFR),
              beforeLR: toDecimal(updateDto.beforeLR),
              afterFR: toDecimal(updateDto.afterFR),
              afterLR: toDecimal(updateDto.afterLR),
              notes: updateDto.notes,
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
    userId: string | null,
  ): Promise<any> {
    // Validate permission before completing
    await this.validateServicePermissionByServiceId(
      userId,
      serviceId,
      'updateServices',
    );

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
        slideSingleHammer: {
          include: {
            beforeData: true,
            data: true,
          },
        },
        slideDoubleHammer: {
          include: {
            outerBefore: true,
            outerData: true,
            innerBefore: true,
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
        shimThickness: {
          include: {
            outerLhData: true,
            outerRhData: true,
            innerLhData: true,
            innerRhData: true,
          },
        },
        dieCushion: true,
        electricalControl: true,
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

    if (completedSectionsList.includes('SLIDE_SINGLE_HAMMER')) {
      this.alertsService
        .generateAlertsForSlideSingleHammer(serviceId)
        .catch((error) => {
          console.error('Error generating slide single hammer alerts:', error);
        });
    }

    if (completedSectionsList.includes('SLIDE_DOUBLE_HAMMER')) {
      this.alertsService
        .generateAlertsForSlideDoubleHammer(serviceId)
        .catch((error) => {
          console.error('Error generating slide double hammer alerts:', error);
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

    if (completedSectionsList.includes('TRAMMING')) {
      this.alertsService.generateAlertsForTramming(serviceId).catch((error) => {
        console.error('Error generating TRAMMING alerts:', error);
      });
    }

    return updatedService;
  }

  async delete(id: string, userId: string | null): Promise<void> {
    // Verify service exists and get machineId for permission check
    const service = await this.prisma.machineService.findUnique({
      where: { id },
      select: { id: true, machineId: true },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    // Validate permission before deleting
    await this.validateServicePermission(
      userId,
      service.machineId,
      'deleteServices',
    );

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
        alertSlideSingleHammer: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertSlideDoubleHammer: {
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
        alertCounterbalanceCylinderAirbag: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        alertTramming: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
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

    // Process Slide Single Hammer alerts
    if (
      service.alertSlideSingleHammer &&
      service.alertSlideSingleHammer.length > 0
    ) {
      const alert = service.alertSlideSingleHammer[0];
      const alerts: AlertDetailDto[] = [];
      let sectionSeverity: AlertSeverityDto = 'NONE';

      const severity = alert.maxDeviation_severity as AlertSeverityDto;
      if (severity === 'YELLOW' || severity === 'RED') {
        alerts.push({
          field: 'maxDeviation',
          fieldLabel: 'Max Deviation',
          value: alert.maxDeviation_differential?.toString() || '0',
          severity,
        });
        alertCount++;
        sectionSeverity = severity;
      }

      if (alerts.length > 0) {
        sections.push({
          sectionKey: 'SLIDE_SINGLE_HAMMER',
          sectionName: 'Slide (Single Hammer)',
          severity: sectionSeverity,
          alerts,
        });
        updateHighestSeverity(sectionSeverity);
      }
    }

    // Process Slide Double Hammer alerts
    if (
      service.alertSlideDoubleHammer &&
      service.alertSlideDoubleHammer.length > 0
    ) {
      const alert = service.alertSlideDoubleHammer[0];
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
          sectionKey: 'SLIDE_DOUBLE_HAMMER',
          sectionName: 'Slide (Double Hammer)',
          severity: sectionSeverity,
          alerts,
        });
        updateHighestSeverity(sectionSeverity);
      }
    }

    // Legacy: Process old Slide alerts (DEPRECATED)
    if (
      service.alertSlide &&
      service.alertSlide.length > 0 &&
      !(service.alertSlideSingleHammer?.length > 0) &&
      !(service.alertSlideDoubleHammer?.length > 0)
    ) {
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
          sectionKey: 'SLIDE_DOUBLE_HAMMER',
          sectionName: 'Slide (Double Hammer)',
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

    // Process Tramming alerts
    console.log('🔍 Checking tramming alerts:', {
      hasAlertTramming: !!service.alertTramming,
      alertTrammingLength: service.alertTramming?.length,
      alertTramming: service.alertTramming,
    });

    if (service.alertTramming && service.alertTramming.length > 0) {
      console.log('✅ Processing tramming alerts');
      const alert = service.alertTramming[0];
      const alerts: AlertDetailDto[] = [];
      let sectionSeverity: AlertSeverityDto = 'NONE';

      const trammingFields = [
        // Outer section
        {
          field: 'outer_top_vertical',
          label: 'Top Vertical (Outer)',
          severity: alert.outer_top_verticalSeverity as AlertSeverityDto,
          value: alert.outer_top_verticalSum?.toString() || '0',
        },
        {
          field: 'outer_top_horizontal',
          label: 'Top Horizontal (Outer)',
          severity: alert.outer_top_horizontalSeverity as AlertSeverityDto,
          value: alert.outer_top_horizontalSum?.toString() || '0',
        },
        {
          field: 'outer_bottom_vertical',
          label: 'Bottom Vertical (Outer)',
          severity: alert.outer_bottom_verticalSeverity as AlertSeverityDto,
          value: alert.outer_bottom_verticalSum?.toString() || '0',
        },
        {
          field: 'outer_bottom_horizontal',
          label: 'Bottom Horizontal (Outer)',
          severity: alert.outer_bottom_horizontalSeverity as AlertSeverityDto,
          value: alert.outer_bottom_horizontalSum?.toString() || '0',
        },
        {
          field: 'outer_left_vertical',
          label: 'Left Vertical (Outer)',
          severity: alert.outer_left_verticalSeverity as AlertSeverityDto,
          value: alert.outer_left_verticalSum?.toString() || '0',
        },
        {
          field: 'outer_left_horizontal',
          label: 'Left Horizontal (Outer)',
          severity: alert.outer_left_horizontalSeverity as AlertSeverityDto,
          value: alert.outer_left_horizontalSum?.toString() || '0',
        },
        {
          field: 'outer_right_vertical',
          label: 'Right Vertical (Outer)',
          severity: alert.outer_right_verticalSeverity as AlertSeverityDto,
          value: alert.outer_right_verticalSum?.toString() || '0',
        },
        {
          field: 'outer_right_horizontal',
          label: 'Right Horizontal (Outer)',
          severity: alert.outer_right_horizontalSeverity as AlertSeverityDto,
          value: alert.outer_right_horizontalSum?.toString() || '0',
        },
        // Inner section
        {
          field: 'inner_top_vertical',
          label: 'Top Vertical (Inner)',
          severity: alert.inner_top_verticalSeverity as AlertSeverityDto,
          value: alert.inner_top_verticalSum?.toString() || '0',
        },
        {
          field: 'inner_top_horizontal',
          label: 'Top Horizontal (Inner)',
          severity: alert.inner_top_horizontalSeverity as AlertSeverityDto,
          value: alert.inner_top_horizontalSum?.toString() || '0',
        },
        {
          field: 'inner_bottom_vertical',
          label: 'Bottom Vertical (Inner)',
          severity: alert.inner_bottom_verticalSeverity as AlertSeverityDto,
          value: alert.inner_bottom_verticalSum?.toString() || '0',
        },
        {
          field: 'inner_bottom_horizontal',
          label: 'Bottom Horizontal (Inner)',
          severity: alert.inner_bottom_horizontalSeverity as AlertSeverityDto,
          value: alert.inner_bottom_horizontalSum?.toString() || '0',
        },
        {
          field: 'inner_left_vertical',
          label: 'Left Vertical (Inner)',
          severity: alert.inner_left_verticalSeverity as AlertSeverityDto,
          value: alert.inner_left_verticalSum?.toString() || '0',
        },
        {
          field: 'inner_left_horizontal',
          label: 'Left Horizontal (Inner)',
          severity: alert.inner_left_horizontalSeverity as AlertSeverityDto,
          value: alert.inner_left_horizontalSum?.toString() || '0',
        },
        {
          field: 'inner_right_vertical',
          label: 'Right Vertical (Inner)',
          severity: alert.inner_right_verticalSeverity as AlertSeverityDto,
          value: alert.inner_right_verticalSum?.toString() || '0',
        },
        {
          field: 'inner_right_horizontal',
          label: 'Right Horizontal (Inner)',
          severity: alert.inner_right_horizontalSeverity as AlertSeverityDto,
          value: alert.inner_right_horizontalSum?.toString() || '0',
        },
      ];

      for (const f of trammingFields) {
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
        console.log('✅ Adding tramming section with alerts:', {
          alertCount: alerts.length,
          severity: sectionSeverity,
        });
        sections.push({
          sectionKey: 'TRAMMING',
          sectionName: 'Tramming',
          severity: sectionSeverity,
          alerts,
        });
        updateHighestSeverity(sectionSeverity);
      } else {
        console.log('⚠️ No YELLOW/RED tramming alerts found');
      }
    }

    const result = {
      hasAlerts: alertCount > 0,
      alertCount,
      highestSeverity,
      sections,
    };

    console.log('📊 Final alerts summary:', {
      hasAlerts: result.hasAlerts,
      alertCount: result.alertCount,
      highestSeverity: result.highestSeverity,
      sectionKeys: sections.map((s) => s.sectionKey),
    });

    return result;
  }
}
