import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { Public } from 'src/modules/auth/auth.decorators';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}
  @Public()
  @Post()
  create(@Body() createMachineDto: CreateMachineDto) {
    return this.machinesService.create(createMachineDto);
  }
  @Public()
  @Get()
  findAll() {
    return this.machinesService.findAll();
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.machinesService.findOne(id);
  }
}
