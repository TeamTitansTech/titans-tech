import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import {
  CreateCompanyDto,
  CreateCompanySchema,
  UpdateCompanyDto,
  UpdateCompanySchema,
  UpdateUserDto,
  UpdateUserSchema,
  CreateCompanyBranchDto,
  CreateCompanyBranchSchema,
  LoginDto,
  LoginSchema,
} from '@titans-tech/shared/backend-dtos';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import {
  Admin,
  Authenticated,
  BranchPermission,
  CompanyAdmin,
  Public,
} from '../auth/auth.decorators';
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

  @Public()
  @Post(':companyId/login')
  loginUser(
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(LoginSchema)) loginDto: LoginDto,
  ) {
    return this.usersService.login(
      loginDto.email,
      loginDto.password,
      companyId,
    );
  }

  @Public()
  @Get('public/:companySlug')
  getPublicInfo(@Param('companySlug') companySlug: string) {
    return this.companiesService.getCompanyPublicInfo(companySlug);
  }

  @Authenticated()
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
  @CompanyAdmin()
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
  ) {
    return this.usersService.update(userId, companyId, updateUserDto);
  }

  @BranchPermission('deleteUsers')
  @Delete(':companyId/users/:userId')
  removeUser(
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
  ) {
    return this.usersService.remove(userId, companyId);
  }

  @Authenticated()
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
