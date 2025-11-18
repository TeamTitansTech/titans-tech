import { Controller, Get, Post, Put, Patch, Body, Param } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CompleteServiceDto } from './dto/complete-service.dto';
import {
  UpdateBearingClearanceDto,
  UpdateSlideDto,
  UpdateGibsDto,
  UpdateLubricationHydraulicsDto,
  UpdateClutchDto,
  UpdateCounterbalanceCylinderDto,
  UpdateTrammingDto,
  UpdatePistonsDto,
} from './dto/sections';
import { Public, Authenticated } from 'src/modules/auth/auth.decorators';
import { LatestReportResponseDto } from '@titans-tech/shared';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}
  @Public()
  @Post()
  create(@Body() createServiceDto: CreateServiceDto): Promise<unknown> {
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
    @Body() updateDto: UpdateServiceDto,
  ): Promise<unknown> {
    return this.servicesService.update(id, updateDto);
  }

  // Section update endpoints
  @Authenticated()
  @Patch(':id/sections/bearing-clearance')
  updateBearingClearance(
    @Param('id') id: string,
    @Body() updateDto: UpdateBearingClearanceDto,
  ): Promise<unknown> {
    return this.servicesService.updateBearingClearance(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/slide')
  updateSlide(
    @Param('id') id: string,
    @Body() updateDto: UpdateSlideDto,
  ): Promise<unknown> {
    return this.servicesService.updateSlide(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/gibs')
  updateGibs(
    @Param('id') id: string,
    @Body() updateDto: UpdateGibsDto,
  ): Promise<unknown> {
    return this.servicesService.updateGibs(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/lubrication-hydraulics')
  updateLubricationHydraulics(
    @Param('id') id: string,
    @Body() updateDto: UpdateLubricationHydraulicsDto,
  ): Promise<unknown> {
    return this.servicesService.updateLubricationHydraulics(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/clutch')
  updateClutch(
    @Param('id') id: string,
    @Body() updateDto: UpdateClutchDto,
  ): Promise<unknown> {
    return this.servicesService.updateClutch(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/counterbalance-cylinder')
  updateCounterbalanceCylinder(
    @Param('id') id: string,
    @Body() updateDto: UpdateCounterbalanceCylinderDto,
  ): Promise<unknown> {
    return this.servicesService.updateCounterbalanceCylinder(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/tramming')
  updateTramming(
    @Param('id') id: string,
    @Body() updateDto: UpdateTrammingDto,
  ): Promise<unknown> {
    return this.servicesService.updateTramming(id, updateDto);
  }

  @Authenticated()
  @Patch(':id/sections/pistons')
  updatePistons(
    @Param('id') id: string,
    @Body() updateDto: UpdatePistonsDto,
  ): Promise<unknown> {
    return this.servicesService.updatePistons(id, updateDto);
  }

  // Complete service endpoint
  @Authenticated()
  @Patch(':id/complete')
  completeService(
    @Param('id') id: string,
    @Body() completeDto: CompleteServiceDto,
  ): Promise<unknown> {
    return this.servicesService.completeService(id, completeDto);
  }
}
