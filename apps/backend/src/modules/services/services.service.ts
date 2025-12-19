import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateServiceDto,
  UpdateServicePayload,
  CompleteServiceDto,
  BearingClearanceCheck,
  BearingClearanceSingleHammerCheck,
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
  ElectricalControlCheck,
  PerpendicularityCheck,
  AngularityCheck,
  AlertsSummaryResponseDto,
} from '@titans-tech/shared/backend-dtos';

// Import shared services
import {
  updateService,
  findServiceById,
  findAllServices,
  findServicesByMachine,
  getLatestMachineReport,
  validateServicePermissionByServiceId,
  updateBearingClearance,
  updateBearingClearanceSingleHammer,
  updateSlideSingleHammer,
  updateSlideDoubleHammer,
  updateGibs,
  updateLubricationHydraulics,
  updateClutch,
  updateCounterbalanceCylinder,
  updateTramming,
  updatePistons,
  updateShimThickness,
  updateDieCushion,
  updateElectricalControl,
  updatePerpendicularity,
  updateAngularity,
  getAlertsSummary as getAlertsSummaryFromShared,
  createServiceWithValidation,
  findAllServicesForUser,
  deleteServiceWithValidation,
  completeServiceWithValidation,
} from '@titans-tech/shared/services';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // Error Translation Helper
  // ============================================================================

  private translateError(result: {
    error: { code: string; message: string };
  }): never {
    if (result.error.code === 'NOT_FOUND') {
      throw new NotFoundException(result.error.message);
    }
    if (result.error.code === 'BAD_REQUEST') {
      throw new BadRequestException(result.error.message);
    }
    throw new ForbiddenException(result.error.message);
  }

  // ============================================================================
  // CRUD Operations
  // ============================================================================

  async create(
    createInspectionDto: CreateServiceDto,
    userId: string | null,
  ): Promise<any> {
    const result = await createServiceWithValidation(
      this.prisma,
      createInspectionDto,
      userId,
    );
    if ('error' in result) {
      this.translateError(result);
    }
    return result.service;
  }

  async update(
    serviceId: string,
    updateDto: UpdateServicePayload,
    userId: string | null,
  ): Promise<any> {
    const permResult = await validateServicePermissionByServiceId(
      this.prisma,
      userId,
      serviceId,
      'updateServices',
    );
    if (!permResult.isValid) {
      this.translateError(
        permResult as { error: { code: string; message: string } },
      );
    }

    return updateService(this.prisma, serviceId, updateDto);
  }

  async findAll(userId: string): Promise<any[]> {
    const result = await findAllServicesForUser(this.prisma, userId);
    if ('error' in result) {
      this.translateError(result);
    }
    return result.services;
  }

  async findAllForSysAdmin(): Promise<any[]> {
    return findAllServices(this.prisma);
  }

  async findOne(id: string): Promise<any> {
    const service = await findServiceById(this.prisma, id);
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async findByMachine(machineId: string): Promise<any[]> {
    return findServicesByMachine(this.prisma, machineId);
  }

  async delete(id: string, userId: string | null): Promise<void> {
    const result = await deleteServiceWithValidation(
      this.prisma,
      id,
      userId,
      'deleteServices',
    );
    if (!result.isValid) {
      this.translateError(
        result as { error: { code: string; message: string } },
      );
    }
  }

  // ============================================================================
  // Latest Report
  // ============================================================================

  async getLatestReport(machineId: string): Promise<any> {
    const result = await getLatestMachineReport(this.prisma, machineId);

    if (!result) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    return result;
  }

  // ============================================================================
  // Section Update Methods - Ultra-thin wrappers
  // ============================================================================

  async updateBearingClearance(
    serviceId: string,
    updateDto: BearingClearanceCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updateBearingClearance(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updateBearingClearanceSingleHammer(
    serviceId: string,
    updateDto: BearingClearanceSingleHammerCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updateBearingClearanceSingleHammer(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updateSlideSingleHammer(
    serviceId: string,
    updateDto: SlideSingleHammerCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updateSlideSingleHammer(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updateSlideDoubleHammer(
    serviceId: string,
    updateDto: SlideDoubleHammerCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updateSlideDoubleHammer(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updateGibs(
    serviceId: string,
    updateDto: GibsCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updateGibs(this.prisma, serviceId, userId, updateDto);
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updateLubricationHydraulics(
    serviceId: string,
    updateDto: LubricationHydraulicsCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updateLubricationHydraulics(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updateClutch(
    serviceId: string,
    updateDto: ClutchData,
    userId: string | null,
  ): Promise<any> {
    const result = await updateClutch(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updateCounterbalanceCylinder(
    serviceId: string,
    updateDto: CounterbalanceCylinderCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updateCounterbalanceCylinder(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updateTramming(
    serviceId: string,
    updateDto: TrammingCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updateTramming(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updatePistons(
    serviceId: string,
    updateDto: PistonsCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updatePistons(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updateShimThickness(
    serviceId: string,
    updateDto: ShimThicknessCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updateShimThickness(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updateDieCushion(
    serviceId: string,
    updateDto: DieCushionCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updateDieCushion(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updateElectricalControl(
    serviceId: string,
    updateDto: ElectricalControlCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updateElectricalControl(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updatePerpendicularity(
    serviceId: string,
    updateDto: PerpendicularityCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updatePerpendicularity(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  async updateAngularity(
    serviceId: string,
    updateDto: AngularityCheck,
    userId: string | null,
  ): Promise<any> {
    const result = await updateAngularity(
      this.prisma,
      serviceId,
      userId,
      updateDto,
    );
    if ('error' in result) this.translateError(result);
    return result.service;
  }

  // ============================================================================
  // Complete Service
  // ============================================================================

  async completeService(
    serviceId: string,
    completeDto: CompleteServiceDto,
    userId: string | null,
  ): Promise<any> {
    const result = await completeServiceWithValidation(
      this.prisma,
      serviceId,
      userId,
      'updateServices',
      completeDto,
    );

    if (!result.isValid) {
      this.translateError(
        result as { error: { code: string; message: string } },
      );
    }

    return result.service;
  }

  // ============================================================================
  // Alerts Summary
  // ============================================================================

  async getAlertsSummary(serviceId: string): Promise<AlertsSummaryResponseDto> {
    const result = await getAlertsSummaryFromShared(this.prisma, serviceId);
    if ('error' in result) {
      throw new NotFoundException(
        (result as { error: { message: string } }).error.message,
      );
    }
    return result;
  }
}
