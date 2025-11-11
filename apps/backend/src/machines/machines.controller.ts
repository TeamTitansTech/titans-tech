import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { Public } from 'src/modules/auth/auth.decorators';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}
  @Public()
  @Post()
  create(
    @Body() createMachineDto: CreateMachineDto,
  ): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>
  > {
    return this.machinesService.create(createMachineDto);
  }
  @Public()
  @Get()
  findAll(): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>[]
  > {
    return this.machinesService.findAll();
  }
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<
    Prisma.MachineGetPayload<{
      include: {
        blueprint: true;
        fields: true;
        inspections: {
          include: {
            bearingClearanceChecks: {
              include: {
                before: true;
                after: true;
              };
            };
          };
        };
      };
    }>
  > {
    return this.machinesService.findOne(id);
  }
}
