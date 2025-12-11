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
  SlideSingleHammerCheck,
  SlideSingleHammerCheckSchema,
  SlideDoubleHammerCheck,
  SlideDoubleHammerCheckSchema,
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
import { Authenticated, ResourcePermission } from '../auth/auth.decorators';
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
   * Dispatches to different actions based on user type (SysAdmin vs regular user)
   */
  private dispatchByUserType<T>(
    user: ReqWithAuthUser['user'],
    sysAdminAction: () => T,
    userAction: (userId: string) => T,
  ): T {
    if (isSysAdmin(user)) {
      return sysAdminAction();
    }
    return userAction(user.id);
  }

  /**
   * Create a new service/inspection
   */
  @ResourcePermission('machine', 'createServices', {
    paramName: 'machineId',
    fromBody: true,
  })
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
   * Filters by user's accessible branches with readServices permission
   */
  @Authenticated()
  @Get()
  findAll(@Req() req: ReqWithAuthUser): Promise<unknown> {
    return this.dispatchByUserType(
      req.user,
      () => this.servicesService.findAllForSysAdmin(),
      (userId) => this.servicesService.findAll(userId),
    );
  }

  /**
   * Get service by ID
   */
  @ResourcePermission('service', 'readServices')
  @Get(':id')
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.servicesService.findOne(id);
  }

  /**
   * Get services for a specific machine
   */
  @ResourcePermission('machine', 'readServices', { paramName: 'machineId' })
  @Get('machine/:machineId')
  findByMachine(@Param('machineId') machineId: string): Promise<unknown> {
    return this.servicesService.findByMachine(machineId);
  }

  @ResourcePermission('machine', 'readServices', { paramName: 'machineId' })
  @Get('machines/:machineId/latest-report')
  getLatestReport(
    @Param('machineId') machineId: string,
  ): Promise<LatestReportResponseDto> {
    return this.servicesService.getLatestReport(machineId);
  }

  // Update service (for basic service info and inspection observations)
  @ResourcePermission('service', 'updateServices')
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
  @ResourcePermission('service', 'updateServices')
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

  @ResourcePermission('service', 'updateServices')
  @Patch(':id/sections/slide-single-hammer')
  updateSlideSingleHammer(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(SlideSingleHammerCheckSchema))
    updateDto: SlideSingleHammerCheck,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.updateSlideSingleHammer(
      id,
      updateDto,
      this.getUserId(req),
    );
  }

  @ResourcePermission('service', 'updateServices')
  @Patch(':id/sections/slide-double-hammer')
  updateSlideDoubleHammer(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(SlideDoubleHammerCheckSchema))
    updateDto: SlideDoubleHammerCheck,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.updateSlideDoubleHammer(
      id,
      updateDto,
      this.getUserId(req),
    );
  }

  @ResourcePermission('service', 'updateServices')
  @Patch(':id/sections/gibs')
  updateGibs(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(GibsCheckSchema))
    updateDto: GibsCheck,
    @Req() req: ReqWithAuthUser,
  ): Promise<unknown> {
    return this.servicesService.updateGibs(id, updateDto, this.getUserId(req));
  }

  @ResourcePermission('service', 'updateServices')
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

  @ResourcePermission('service', 'updateServices')
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

  @ResourcePermission('service', 'updateServices')
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

  @ResourcePermission('service', 'updateServices')
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

  @ResourcePermission('service', 'updateServices')
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
  @ResourcePermission('service', 'updateServices')
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
  @ResourcePermission('service', 'deleteServices')
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: ReqWithAuthUser): Promise<void> {
    return this.servicesService.delete(id, this.getUserId(req));
  }

  // Get alerts summary for a service
  @ResourcePermission('service', 'readServices')
  @Get(':id/alerts-summary')
  getAlertsSummary(@Param('id') id: string): Promise<AlertsSummaryResponseDto> {
    return this.servicesService.getAlertsSummary(id);
  }
}
