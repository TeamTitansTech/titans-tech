import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Request,
  Param,
} from '@nestjs/common';
import { CompanyBranchesService } from './company-branches.service';
import {
  CreateCompanyBranchDto,
  CreateCompanyBranchSchema,
  UpdateCompanyBranchDto,
  UpdateCompanyBranchSchema,
  CreateUserDto,
  CreateUserSchema,
} from '@titans-tech/shared';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { Admin, BranchPermission } from '../auth/auth.decorators';
import { ReqWithAuthUser } from '../../types/request';
import { UsersService } from '../users/users.service';

@Controller('company-branches')
export class CompanyBranchesController {
  constructor(
    private readonly companyBranchesService: CompanyBranchesService,
    private readonly usersService: UsersService,
  ) {}

  @Admin()
  @Get()
  findAll(@Request() req: ReqWithAuthUser) {
    return this.companyBranchesService.findAll(req.companyId);
  }

  @BranchPermission('read')
  @Get(':branchId')
  findOne(
    @Param('branchId') branchId: string,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.companyBranchesService.findOne(branchId, req.companyId);
  }

  @Admin()
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateCompanyBranchSchema))
    createBranchDto: CreateCompanyBranchDto,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.companyBranchesService.create(req.companyId, createBranchDto);
  }

  @BranchPermission('updateUser')
  @Patch(':branchId')
  update(
    @Param('branchId') branchId: string,
    @Body(new ZodValidationPipe(UpdateCompanyBranchSchema))
    updateBranchDto: UpdateCompanyBranchDto,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.companyBranchesService.update(
      branchId,
      req.companyId,
      updateBranchDto,
    );
  }

  @Admin()
  @Delete(':branchId')
  remove(@Param('branchId') branchId: string, @Request() req: ReqWithAuthUser) {
    return this.companyBranchesService.remove(branchId, req.companyId);
  }

  @BranchPermission('createUser')
  @Post(':branchId/users')
  createUser(
    @Param('branchId') branchId: string,
    @Body(new ZodValidationPipe(CreateUserSchema))
    createUserDto: CreateUserDto,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.usersService.createWithBranch(
      req.companyId,
      branchId,
      createUserDto,
    );
  }
}
