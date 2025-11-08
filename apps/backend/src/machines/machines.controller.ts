import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post()
  create(@Body() createMachineDto: CreateMachineDto) {
    return this.machinesService.create(createMachineDto);
  }

  @Get()
  findAll() {
    return this.machinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.machinesService.findOne(id);
  }
}
