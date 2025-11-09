import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { CompanyBranchesService } from './company-branches.service';
import {
  UpdateCompanyBranchDto,
  UpdateCompanyBranchSchema,
  CreateUserDto,
  CreateUserSchema,
} from '@titans-tech/shared';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { Admin, BranchPermission } from '../auth/auth.decorators';
import { UsersService } from '../users/users.service';

@Controller('company-branches')
export class CompanyBranchesController {
  constructor(
    private readonly companyBranchesService: CompanyBranchesService,
    private readonly usersService: UsersService,
  ) {}

  @BranchPermission('read')
  @Get(':branchId')
  findOne(@Param('branchId') branchId: string) {
    return this.companyBranchesService.findOne(branchId);
  }

  @BranchPermission('updateUser')
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

  @BranchPermission('createUser')
  @Post(':branchId/users')
  createUser(
    @Param('branchId') branchId: string,
    @Body(new ZodValidationPipe(CreateUserSchema))
    createUserDto: CreateUserDto,
  ) {
    return this.usersService.createWithBranch(branchId, createUserDto);
  }

  @BranchPermission('assignUserToBranch')
  @Post(':branchId/users/:userId')
  addUserToBranch(
    @Param('branchId') branchId: string,
    @Param('userId') userId: string,
  ) {
    return this.usersService.addUserToBranch(branchId, userId);
  }

  @BranchPermission('assignUserToBranch')
  @Delete(':branchId/users/:userId')
  removeUserFromBranch(
    @Param('branchId') branchId: string,
    @Param('userId') userId: string,
  ) {
    return this.usersService.removeUserFromBranch(branchId, userId);
  }
}
