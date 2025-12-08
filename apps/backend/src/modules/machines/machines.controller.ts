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
import { EmailService } from '../email/email.service';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateMachineDto,
  CreateMachineSchema,
  UpdateMachineDto,
  UpdateMachineSchema,
  SendPartsEmailDto,
  SendPartsEmailDtoSchema,
} from '@titans-tech/shared/backend-dtos';
import {
  Authenticated,
  BranchPermission,
  Public,
  ResourcePermission,
} from '../auth/auth.decorators';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { ReqWithAuthUser, isSysAdmin } from '../../types/request';

@Controller('machines')
export class MachinesController {
  constructor(
    private readonly machinesService: MachinesService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

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
  @ResourcePermission('machine', 'readMachines')
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
            alertBearingClearance: true;
            alertClutch: true;
            alertSlide: true;
            alertGibs: true;
            alertPistons: true;
            alertTramming: true;
            alertCounterbalanceCylinderAirbag: true;
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
  @ResourcePermission('machine', 'updateMachines')
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
  @ResourcePermission('machine', 'deleteMachines')
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

  /**
   * Send parts replacement request via email
   * Sends an email with selected parts to the specified recipients
   */
  @ResourcePermission('machine', 'readMachines', {
    paramName: 'machineId',
    fromBody: true,
  })
  @Post('send-parts-email')
  async sendPartsEmail(
    @Request() req: ReqWithAuthUser,
    @Body(new ZodValidationPipe(SendPartsEmailDtoSchema))
    sendPartsEmailDto: SendPartsEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    // Get the machine to validate access and get company/branch info
    const machine = await this.dispatchByUserType(
      req.user,
      () =>
        this.machinesService.findOneForSysAdmin(sendPartsEmailDto.machineId),
      (userId) =>
        this.machinesService.findOne(userId, sendPartsEmailDto.machineId),
    );

    // Get user info for "requested by" field
    let requestedBy = 'System Administrator';
    if (!isSysAdmin(req.user)) {
      const user = await this.prisma.user.findUnique({
        where: { id: req.user.id },
        select: { name: true, email: true },
      });
      requestedBy = user?.name || user?.email || 'Unknown User';
    }

    // Get company and branch names from the machine
    // Type assertion needed because the return type doesn't include branch relation
    const machineWithBranch = machine as typeof machine & {
      branch?: { name?: string; company?: { name?: string } };
    };
    const companyName = machineWithBranch.branch?.company?.name || 'N/A';
    const branchName = machineWithBranch.branch?.name || 'N/A';

    // Calculate total parts
    const totalParts = sendPartsEmailDto.partsGroups.reduce(
      (sum, group) => sum + group.parts.length,
      0,
    );

    // Send the email
    await this.emailService.sendPartsRequestEmail(
      sendPartsEmailDto.emails,
      {
        machineName: sendPartsEmailDto.machineName,
        machineSerial: sendPartsEmailDto.machineSerial,
        sectionName: sendPartsEmailDto.sectionName,
        companyName,
        branchName,
        requestedBy,
        requestDate: new Date().toLocaleDateString(),
        partsGroups: sendPartsEmailDto.partsGroups,
        totalParts,
      },
      sendPartsEmailDto.machineId,
    );

    return {
      success: true,
      message: `Parts request sent to ${sendPartsEmailDto.emails.length} recipient(s)`,
    };
  }
}
