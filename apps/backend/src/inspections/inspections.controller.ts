import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { Public } from 'src/modules/auth/auth.decorators';

@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}
  @Public()
  @Post()
  create(@Body() createInspectionDto: CreateInspectionDto) {
    return this.inspectionsService.create(createInspectionDto);
  }
  @Public()
  @Get()
  findAll() {
    return this.inspectionsService.findAll();
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inspectionsService.findOne(id);
  }
  @Public()
  @Get('machine/:machineId')
  findByMachine(@Param('machineId') machineId: string) {
    return this.inspectionsService.findByMachine(machineId);
  }
}
