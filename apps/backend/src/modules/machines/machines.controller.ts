import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { MachinesService } from './machines.service';
import {
  CreateMachineDto,
  CreateMachineSchema,
  UpdateMachineDto,
  UpdateMachineSchema,
} from '@titans-tech/shared/backend-dtos';
import {
  Authenticated,
  BranchPermission,
  Public,
} from '../auth/auth.decorators';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { ReqWithAuthUser, isSysAdmin } from '../../types/request';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  /**
   * Helper to dispatch operations based on user type
   * @param user - The authenticated user from the request
   * @param sysAdminAction - Action to execute for SysAdmin users
   * @param userAction - Action to execute for regular users (receives userId)
   */
  private dispatchByUserType<T>(
    user: ReqWithAuthUser['user'],
    sysAdminAction: () => T,
    userAction: (userId: string) => T,
  ): T {
    if (isSysAdmin(user)) {
      return sysAdminAction();
    }
    return userAction(user.id);
  }

  /**
   * Get public machine info (no authentication required)
   * Used for QR code scanning - returns basic machine info
   * NOTE: This route MUST be defined before :id routes to avoid route conflicts
   */
  @Public()
  @Get(':id/public')
  getPublicInfo(@Param('id') id: string) {
    return this.machinesService.getPublicInfo(id);
  }

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
   * Filters by user's accessible branches for regular users
   * Returns all machines for SysAdmin
   */
  @Authenticated()
  @Get()
  findAll(@Request() req: ReqWithAuthUser): Promise<
    Prisma.MachineGetPayload<{
      include: {
        blueprint: true;
        fields: true;
      };
    }>[]
  > {
    return this.dispatchByUserType(
      req.user,
      () => this.machinesService.findAllForSysAdmin(),
      (userId) => this.machinesService.findAll(userId),
    );
  }

  /**
   * Get machine by ID
   * Validates user has access to the machine's branch
   */
  @Authenticated()
  @Get(':id')
  findOne(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
  ): Promise<
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
    return this.dispatchByUserType(
      req.user,
      () => this.machinesService.findOneForSysAdmin(id),
      (userId) => this.machinesService.findOne(userId, id),
    );
  }

  /**
   * Update machine
   * Validates user has access to the machine's branch
   */
  @Authenticated()
  @Put(':id')
  update(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateMachineSchema))
    updateMachineDto: UpdateMachineDto,
  ): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>
  > {
    return this.dispatchByUserType(
      req.user,
      () => this.machinesService.updateForSysAdmin(id, updateMachineDto),
      (userId) => this.machinesService.update(userId, id, updateMachineDto),
    );
  }

  /**
   * Delete machine
   * Validates user has access to the machine's branch
   */
  @Authenticated()
  @Delete(':id')
  delete(
    @Request() req: ReqWithAuthUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.dispatchByUserType(
      req.user,
      () => this.machinesService.deleteForSysAdmin(id),
      (userId) => this.machinesService.delete(userId, id),
    );
  }
}
