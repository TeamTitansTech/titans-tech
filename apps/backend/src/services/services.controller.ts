import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
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
  @Public()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ): Promise<unknown> {
    return this.servicesService.update(id, updateServiceDto);
  }

  @Authenticated()
  @Get('machines/:machineId/latest-report')
  getLatestReport(
    @Param('machineId') machineId: string,
  ): Promise<LatestReportResponseDto> {
    return this.servicesService.getLatestReport(machineId);
  }
}
