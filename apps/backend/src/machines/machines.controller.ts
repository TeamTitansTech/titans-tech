import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { MachinesService } from './machines.service';
import {
  CreateMachineDto,
  CreateMachineSchema,
  UpdateMachineDto,
  UpdateMachineSchema,
} from '@titans-tech/shared/backend-dtos';
import { Authenticated, Public } from 'src/modules/auth/auth.decorators';
import { ZodValidationPipe } from '../errors/zod-validation.pipe';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Authenticated()
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateMachineSchema))
    createMachineDto: CreateMachineDto,
  ): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>
  > {
    return this.machinesService.create(createMachineDto);
  }

  @Authenticated()
  @Get()
  findAll(): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>[]
  > {
    return this.machinesService.findAll();
  }

  @Public()
  @Get(':id/company')
  getMachineCompanyInfo(@Param('id') id: string): Promise<{
    companyId: string;
    companyName: string;
    companySlug: string;
  }> {
    return this.machinesService.getMachineCompanyInfo(id);
  }

  @Authenticated()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<
    Prisma.MachineGetPayload<{
      include: {
        blueprint: true;
        fields: true;
        services: {
          include: {
            bearingClearance: {
              include: {
                outerBefore: true;
                outerAfter: true;
                innerBefore: true;
                innerAfter: true;
              };
            };
          };
        };
      };
    }>
  > {
    return this.machinesService.findOne(id);
  }

  @Authenticated()
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateMachineSchema))
    updateMachineDto: UpdateMachineDto,
  ): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>
  > {
    return this.machinesService.update(id, updateMachineDto);
  }

  @Authenticated()
  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.machinesService.delete(id);
  }
}
