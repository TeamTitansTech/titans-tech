import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';

@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  create(@Body() createInspectionDto: CreateInspectionDto) {
    return this.inspectionsService.create(createInspectionDto);
  }

  @Get()
  findAll() {
    return this.inspectionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inspectionsService.findOne(id);
  }

  @Get('machine/:machineId')
  findByMachine(@Param('machineId') machineId: string) {
    return this.inspectionsService.findByMachine(machineId);
  }
}
