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
import { Authenticated, BranchPermission } from '../auth/auth.decorators';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  /**
   * Create a new machine
   * Requires createMachines permission for the target branch (branchId in body)
   */
  @BranchPermission('createMachines')
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateMachineSchema))
    createMachineDto: CreateMachineDto,
  ): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>
  > {
    return this.machinesService.create(createMachineDto);
  }

  /**
   * Get all machines
   * TODO: Add @BranchPermission('readMachines') and filter by accessible branches
   * Current: Requires authentication only, returns all machines (should filter by user's branches)
   */
  @Authenticated()
  @Get()
  findAll(): Promise<
    Prisma.MachineGetPayload<{
      include: {
        blueprint: true;
        fields: true;
      };
    }>[]
  > {
    return this.machinesService.findAll();
  }

  /**
   * Get machine by ID
   * TODO: Add @BranchPermission('readMachines') with resource lookup
   * Current: Requires authentication only
   */
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

  /**
   * Update machine
   * TODO: Add @BranchPermission('updateMachines') with resource lookup
   * Current: Requires authentication only
   */
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

  /**
   * Delete machine
   * TODO: Add @BranchPermission('deleteMachines') with resource lookup
   * Current: Requires authentication only
   */
  @Authenticated()
  @Delete(':id')
  delete(@Param('id') id: string): Promise<void> {
    return this.machinesService.delete(id);
  }
}
