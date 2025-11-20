import { Controller, Get, Post, Put, Patch, Body, Param } from '@nestjs/common';
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
  LubricationHydraulicsData,
  LubricationHydraulicsDataSchema,
  ClutchData,
  ClutchDataSchema,
  CounterbalanceCylinderCheck,
  CounterbalanceCylinderCheckSchema,
  TrammingCheck,
  TrammingCheckSchema,
  PistonsCheck,
  PistonsCheckSchema,
  LatestReportResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { Public, Authenticated } from 'src/modules/auth/auth.decorators';
import { ZodValidationPipe } from '../errors/zod-validation.pipe';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}
  @Public()
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateServiceSchema))
    createServiceDto: CreateServiceDto,
  ): Promise<unknown> {
    return this.servicesService.create(createServiceDto);
  }
  @Public()
  @Get()
  findAll(): Promise<unknown> {
    return this.servicesService.findAll();
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.servicesService.findOne(id);
  }
  @Public()
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
  ): Promise<unknown> {
    return this.servicesService.update(id, updateDto);
  }

  // Section update endpoints
  @Authenticated()
  @Patch(':id/sections/bearing-clearance')
  updateBearingClearance(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(BearingClearanceCheckSchema))
    updateDto: BearingClearanceCheck,
  ): Promise<unknown> {
    return this.servicesService.updateBearingClearance(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/slide')
  updateSlide(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(SlideCheckSchema))
    updateDto: SlideCheck,
  ): Promise<unknown> {
    return this.servicesService.updateSlide(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/gibs')
  updateGibs(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(GibsCheckSchema))
    updateDto: GibsCheck,
  ): Promise<unknown> {
    return this.servicesService.updateGibs(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/lubrication-hydraulics')
  updateLubricationHydraulics(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(LubricationHydraulicsDataSchema))
    updateDto: LubricationHydraulicsData,
  ): Promise<unknown> {
    return this.servicesService.updateLubricationHydraulics(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/clutch')
  updateClutch(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ClutchDataSchema))
    updateDto: ClutchData,
  ): Promise<unknown> {
    return this.servicesService.updateClutch(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/counterbalance-cylinder')
  updateCounterbalanceCylinder(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CounterbalanceCylinderCheckSchema))
    updateDto: CounterbalanceCylinderCheck,
  ): Promise<unknown> {
    return this.servicesService.updateCounterbalanceCylinder(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/tramming')
  updateTramming(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(TrammingCheckSchema))
    updateDto: TrammingCheck,
  ): Promise<unknown> {
    return this.servicesService.updateTramming(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/pistons')
  updatePistons(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(PistonsCheckSchema))
    updateDto: PistonsCheck,
  ): Promise<unknown> {
    return this.servicesService.updatePistons(id, updateDto);
  }

  // Complete service endpoint
  @Authenticated()
  @Patch(':id/complete')
  completeService(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(CompleteServiceSchema))
    completeDto: CompleteServiceDto,
  ): Promise<unknown> {
    return this.servicesService.completeService(id, completeDto);
  }
}
