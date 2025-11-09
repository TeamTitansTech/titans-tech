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
import { CompaniesService } from './companies.service';
import {
  CreateCompanyDto,
  CreateCompanySchema,
  UpdateCompanyDto,
  UpdateCompanySchema,
  SysAdminCreateUserDto,
  SysAdminCreateUserSchema,
  UpdateUserDto,
  UpdateUserSchema,
  CreateCompanyBranchDto,
  CreateCompanyBranchSchema,
} from '@titans-tech/shared';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { Admin, BranchPermission } from '../auth/auth.decorators';
import { ReqWithAuthUser } from '../../types/request';
import { UsersService } from '../users/users.service';
import { CompanyBranchesService } from '../company-branches/company-branches.service';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly usersService: UsersService,
    private readonly companyBranchesService: CompanyBranchesService,
  ) {}

  @Admin()
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @BranchPermission('readBranches')
  @Get(':companyId')
  findOne(@Param('companyId') companyId: string) {
    return this.companiesService.findOne(companyId);
  }

  @Admin()
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateCompanySchema))
    createCompanyDto: CreateCompanyDto,
  ) {
    return this.companiesService.create(createCompanyDto);
  }

  @Patch(':companyId')
  @BranchPermission('updateBranches')
  update(
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(UpdateCompanySchema))
    updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(companyId, updateCompanyDto);
  }

  @Admin()
  @Delete(':companyId')
  remove(@Param('companyId') companyId: string) {
    return this.companiesService.remove(companyId);
  }

  @Admin()
  @Post(':companyId/users')
  createUser(
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(SysAdminCreateUserSchema))
    createUserDto: SysAdminCreateUserDto,
  ) {
    return this.usersService.sysAdminCreateUser(companyId, createUserDto);
  }

  @BranchPermission('readUsers')
  @Get(':companyId/users')
  findAllUsers(@Param('companyId') companyId: string) {
    return this.usersService.findAll(companyId);
  }

  @BranchPermission('updateUsers')
  @Patch(':companyId/users/:userId')
  updateUser(
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.usersService.update(userId, companyId, updateUserDto, req.user);
  }

  @BranchPermission('deleteUsers')
  @Delete(':companyId/users/:userId')
  removeUser(
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
  ) {
    return this.usersService.remove(userId, companyId);
  }

  @BranchPermission('readBranches')
  @Get(':companyId/branches')
  findAllBranches(@Param('companyId') companyId: string) {
    return this.companyBranchesService.findAll(companyId);
  }

  @Admin()
  @Post(':companyId/branches')
  createBranch(
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(CreateCompanyBranchSchema))
    createBranchDto: CreateCompanyBranchDto,
  ) {
    return this.companyBranchesService.create(companyId, createBranchDto);
  }
}
