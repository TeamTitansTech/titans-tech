import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { CompanyBranchesService } from './company-branches.service';
import {
  UpdateCompanyBranchDto,
  UpdateCompanyBranchSchema,
  CreateUserDto,
  CreateUserSchema,
  SetUserPermissionsDto,
  SetUserPermissionsSchema,
  SetCompanyAdminDto,
  SetCompanyAdminSchema,
  SetCompanyManagerDto,
  SetCompanyManagerSchema,
  SysAdminCreateUserDto,
  SysAdminCreateUserSchema,
  DeleteUserDto,
  DeleteUserSchema,
  UpdateUserPermissionsDto,
  UpdateUserPermissionsSchema,
} from '@titans-tech/shared/backend-dtos';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { Admin, BranchPermission, CompanyAdmin } from '../auth/auth.decorators';
import { UsersService } from '../users/users.service';
import { MachinesService } from '../../machines/machines.service';
import { isSysAdmin, ReqWithAuthUser } from '../../types/request';

@Controller('company-branches')
export class CompanyBranchesController {
  constructor(
    private readonly companyBranchesService: CompanyBranchesService,
    private readonly usersService: UsersService,
    private readonly machinesService: MachinesService,
  ) {}

  @BranchPermission('readBranches')
  @Get(':branchId')
  findOne(@Param('branchId') branchId: string) {
    return this.companyBranchesService.findOne(branchId);
  }

  @BranchPermission('updateBranches')
  @Patch(':branchId')
  update(
    @Param('branchId') branchId: string,
    @Body(new ZodValidationPipe(UpdateCompanyBranchSchema))
    updateBranchDto: UpdateCompanyBranchDto,
  ) {
    return this.companyBranchesService.update(branchId, updateBranchDto);
  }

  @Admin()
  @Delete(':branchId')
  remove(@Param('branchId') branchId: string) {
    return this.companyBranchesService.remove(branchId);
  }

  @BranchPermission('createUsers')
  @Post(':branchId/users')
  createUser(
    @Param('branchId') branchId: string,
    @Body()
    createUserDto: CreateUserDto | SysAdminCreateUserDto,
    @Request() req: ReqWithAuthUser,
  ) {
    if (isSysAdmin(req.user)) {
      const sysAdminDto = SysAdminCreateUserSchema.parse(createUserDto);
      return this.usersService.sysAdminCreateUser(branchId, sysAdminDto);
    }
    const userDto = CreateUserSchema.parse(createUserDto);
    return this.usersService.createWithBranch(branchId, userDto);
  }

  @BranchPermission('assignUsersToBranches')
  @Post(':branchId/users/:userId')
  addUserToBranch(
    @Param('branchId') branchId: string,
    @Param('userId') userId: string,
  ) {
    return this.usersService.addUserToBranch(branchId, userId);
  }

  @BranchPermission('assignUsersToBranches')
  @Delete(':branchId/users/:userId')
  removeUserFromBranch(
    @Param('branchId') branchId: string,
    @Param('userId') userId: string,
  ) {
    return this.usersService.removeUserFromBranch(branchId, userId);
  }

  @BranchPermission('manageUserPermissions')
  @Patch(':branchId/users/:userId/permissions')
  setUserPermissions(
    @Param('branchId') branchId: string,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(SetUserPermissionsSchema))
    permissionsDto: SetUserPermissionsDto,
  ) {
    return this.companyBranchesService.setUserPermissions(
      branchId,
      userId,
      permissionsDto,
    );
  }

  @BranchPermission('readMachines')
  @Get(':branchId/machines')
  getMachines(
    @Param('branchId') branchId: string,
  ): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>[]
  > {
    return this.companyBranchesService.getMachines(branchId);
  }

  @BranchPermission('createMachines')
  @Post(':branchId/machines')
  createMachine(
    @Param('branchId') branchId: string,
    @Body() createMachineDto: any,
  ): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>
  > {
    return this.machinesService.create(createMachineDto);
  }

  @Admin()
  @Patch(':branchId/users/:userId/company-admin')
  setCompanyAdmin(
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(SetCompanyAdminSchema))
    dto: SetCompanyAdminDto,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.usersService.setCompanyAdmin(userId, dto, req.user);
  }

  @CompanyAdmin()
  @Patch(':branchId/users/:userId/company-manager')
  setCompanyManager(
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(SetCompanyManagerSchema))
    dto: SetCompanyManagerDto,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.usersService.setCompanyManager(userId, dto, req.user);
  }

  /**
   * Delete user from company or remove from branch
   * Scope: 'branch' = remove from specific branch only
   * Scope: 'company' = delete user completely
   */
  @BranchPermission('deleteUsers')
  @Delete(':branchId/users/:userId/delete')
  deleteUser(
    @Param('branchId') branchId: string,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(DeleteUserSchema))
    dto: DeleteUserDto,
  ) {
    return this.usersService.deleteUser(userId, dto.scope, branchId);
  }

  /**
   * Update user permissions across all branches they belong to
   * Requires manageUserPermissions permission
   */
  @BranchPermission('manageUserPermissions')
  @Patch(':branchId/users/:userId/permissions-all-branches')
  updateUserPermissionsAllBranches(
    @Param('branchId') branchId: string,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(UpdateUserPermissionsSchema))
    dto: UpdateUserPermissionsDto,
    @Request() req: ReqWithAuthUser,
  ) {
    // BranchPermission guard ensures this is a company user, not a sys admin
    if (isSysAdmin(req.user)) {
      throw new ForbiddenException('System admins cannot access this endpoint');
    }

    const companyId = req.user.companyId;

    // Extract permissions (remove applyToAllBranches flag)
    const { applyToAllBranches, ...permissions } = dto;

    return this.usersService.updateUserPermissionsAllBranches(
      userId,
      companyId,
      permissions,
    );
  }
}
