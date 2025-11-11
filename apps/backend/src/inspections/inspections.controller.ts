import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { InspectionsService } from './inspections.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { Public } from 'src/modules/auth/auth.decorators';

@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}
  @Public()
  @Post()
  create(@Body() createInspectionDto: CreateInspectionDto): Promise<
    Prisma.MachineInspectionGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearanceChecks: { include: { before: true; after: true } };
      };
    }>
  > {
    return this.inspectionsService.create(createInspectionDto);
  }
  @Public()
  @Get()
  findAll(): Promise<
    Prisma.MachineInspectionGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearanceChecks: { include: { before: true; after: true } };
      };
    }>[]
  > {
    return this.inspectionsService.findAll();
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<
    Prisma.MachineInspectionGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearanceChecks: { include: { before: true; after: true } };
      };
    }>
  > {
    return this.inspectionsService.findOne(id);
  }
  @Public()
  @Get('machine/:machineId')
  findByMachine(@Param('machineId') machineId: string): Promise<
    Prisma.MachineInspectionGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearanceChecks: { include: { before: true; after: true } };
      };
    }>[]
  > {
    return this.inspectionsService.findByMachine(machineId);
  }
}
