import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import {
  CreateServiceDto,
  CreateServiceSchema,
  UpdateServicePayload,
  UpdateServicePayloadSchema,
  CompleteServiceDto,
  CompleteServiceSchema,
  BearingClearanceCheck,
  BearingClearanceCheckSchema,
  SlideCheck,
  SlideCheckSchema,
  GibsCheck,
  GibsCheckSchema,
  LubricationHydraulicsCheck,
  LubricationHydraulicsCheckSchema,
  ClutchData,
  ClutchDataSchema,
  CounterbalanceCylinderCheck,
  CounterbalanceCylinderCheckSchema,
  TrammingCheck,
  TrammingCheckSchema,
  PistonsCheck,
  PistonsCheckSchema,
  LatestReportResponseDto,
  AlertsSummaryResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { Authenticated } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { ReqWithAuthUser, isSysAdmin } from '../../types/request';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /**
   * Extracts user ID from request. Returns null for SysAdmin (full access).
   */
  private getUserId(req: ReqWithAuthUser): string | null {
    return isSysAdmin(req.user) ? null : req.user.id;
  }

  /**
   * Create a new service/inspection
   * Permission check is now handled in the service layer
   */
  @Authenticated()
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateServiceSchema))
    createServiceDto: CreateServiceDto,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.create(createServiceDto, this.getUserId(req));
  }

  /**
   * Get all services
   * TODO: Add @BranchPermission('readServices') and filter by accessible branches
   * Current: Requires authentication only, returns all services (should filter by user's branches)
   */
  @Authenticated()
  @Get()
  findAll(): Promise<unknown> {
    return this.servicesService.findAll();
  }

  /**
   * Get service by ID
   * TODO: Add @BranchPermission('readServices') with resource lookup
   * Current: Requires authentication only
   */
  @Authenticated()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.servicesService.findOne(id);
  }

  /**
   * Get services for a specific machine
   * TODO: Add @BranchPermission('readServices') - need to lookup machine's branchId first
   * Current: Requires authentication only
   */
  @Authenticated()
  @Get('machine/:machineId')
  findByMachine(@Param('machineId') machineId: string): Promise<unknown> {
    return this.servicesService.findByMachine(machineId);
  }

  @Authenticated()
  @Get('machines/:machineId/latest-report')
  getLatestReport(
    @Param('machineId') machineId: string,
  ): Promise<LatestReportResponseDto> {
    return this.servicesService.getLatestReport(machineId);
  }

  // Update service (for basic service info and inspection observations)
  @Authenticated()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateServicePayloadSchema))
    updateDto: UpdateServicePayload,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.update(id, updateDto, this.getUserId(req));
  }

  // Section update endpoints
  @Authenticated()
  @Patch(':id/sections/bearing-clearance')
  updateBearingClearance(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(BearingClearanceCheckSchema))
    updateDto: BearingClearanceCheck,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.updateBearingClearance(
      id,
      updateDto,
      this.getUserId(req),
    );
  }

  @Authenticated()
  @Patch(':id/sections/slide')
  updateSlide(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(SlideCheckSchema))
    updateDto: SlideCheck,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.updateSlide(id, updateDto, this.getUserId(req));
  }

  @Authenticated()
  @Patch(':id/sections/gibs')
  updateGibs(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(GibsCheckSchema))
    updateDto: GibsCheck,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.updateGibs(id, updateDto, this.getUserId(req));
  }

  @Authenticated()
  @Patch(':id/sections/lubrication-hydraulics')
  updateLubricationHydraulics(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(LubricationHydraulicsCheckSchema))
    updateDto: LubricationHydraulicsCheck,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.updateLubricationHydraulics(
      id,
      updateDto,
      this.getUserId(req),
    );
  }

  @Authenticated()
  @Patch(':id/sections/clutch')
  updateClutch(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ClutchDataSchema))
    updateDto: ClutchData,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.updateClutch(
      id,
      updateDto,
      this.getUserId(req),
    );
  }

  @Authenticated()
  @Patch(':id/sections/counterbalance-cylinder')
  updateCounterbalanceCylinder(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CounterbalanceCylinderCheckSchema))
    updateDto: CounterbalanceCylinderCheck,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.updateCounterbalanceCylinder(
      id,
      updateDto,
      this.getUserId(req),
    );
  }

  @Authenticated()
  @Patch(':id/sections/tramming')
  updateTramming(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(TrammingCheckSchema))
    updateDto: TrammingCheck,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.updateTramming(
      id,
      updateDto,
      this.getUserId(req),
    );
  }

  @Authenticated()
  @Patch(':id/sections/pistons')
  updatePistons(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(PistonsCheckSchema))
    updateDto: PistonsCheck,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.updatePistons(
      id,
      updateDto,
      this.getUserId(req),
    );
  }

  // Complete service endpoint
  @Authenticated()
  @Patch(':id/complete')
  completeService(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CompleteServiceSchema))
    completeDto: CompleteServiceDto,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.completeService(
      id,
      completeDto,
      this.getUserId(req),
    );
  }

  // Delete service endpoint
  @Authenticated()
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: ReqWithAuthUser): Promise<void> {
    return this.servicesService.delete(id, this.getUserId(req));
  }

  // Get alerts summary for a service
  @Authenticated()
  @Get(':id/alerts-summary')
  getAlertsSummary(@Param('id') id: string): Promise<AlertsSummaryResponseDto> {
    return this.servicesService.getAlertsSummary(id);
  }
}
