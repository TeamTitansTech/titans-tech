import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { companiesService } from '@titans-tech/shared/services';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateCompanyDto,
  CreateCompanySchema,
  UpdateCompanyDto,
  UpdateCompanySchema,
  UpdateCompanyLimitsDto,
  UpdateCompanyLimitsSchema,
  UpdateUserDto,
  UpdateUserSchema,
  CreateCompanyBranchDto,
  CreateCompanyBranchSchema,
  LoginDto,
  LoginSchema,
  AdminManagerUserResponseDto,
} from '@titans-tech/shared/backend-dtos';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { FieldsErr } from '../../errors/err';
import {
  Admin,
  BranchPermission,
  CompanyAdmin,
  CompanyMember,
  Public,
} from '../auth/auth.decorators';
import { UsersService } from '../users/users.service';
import { CompanyBranchesService } from '../company-branches/company-branches.service';
import { ReqWithAuthUser, isSysAdmin } from '../../types/request';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly companyBranchesService: CompanyBranchesService,
  ) {}

  @Admin()
  @Get()
  findAll() {
    return companiesService.findAll(this.prisma);
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
  async getPublicInfo(@Param('companySlug') companySlug: string) {
    const company = await companiesService.getCompanyPublicInfo(
      this.prisma,
      companySlug,
    );
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  @CompanyMember()
  @Get(':companyId')
  async findOne(@Param('companyId') companyId: string) {
    const company = await companiesService.findOne(this.prisma, companyId);
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  @Admin()
  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateCompanySchema))
    createCompanyDto: CreateCompanyDto,
  ) {
    try {
      return await companiesService.create(
        this.prisma,
        createCompanyDto as any,
      );
    } catch (err: any) {
      if (err?.type === 'FIELDS_ERR') throw FieldsErr(err.payload);
      throw err;
    }
  }

  @Patch(':companyId')
  @CompanyAdmin()
  async update(
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(UpdateCompanySchema))
    updateCompanyDto: UpdateCompanyDto,
  ) {
    try {
      const result = await companiesService.update(
        this.prisma,
        companyId,
        updateCompanyDto as any,
      );
      if (!result) throw new NotFoundException('Company not found');
      return result;
    } catch (err: any) {
      if (err?.type === 'FIELDS_ERR') throw FieldsErr(err.payload);
      throw err;
    }
  }

  @Public()
  @Delete(':companyId')
  async remove(@Param('companyId') companyId: string) {
    const result = await companiesService.remove(this.prisma, companyId);
    if (!result) throw new NotFoundException('Company not found');
    return { success: true };
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

  @CompanyMember()
  @Get(':companyId/branches')
  async findAllBranches(
    @Param('companyId') companyId: string,
    @Req() req: ReqWithAuthUser,
  ) {
    // SysAdmin or CompanyAdmin can see all branches
    if (isSysAdmin(req.user) || req.isCompanyAdmin) {
      return this.companyBranchesService.findAllByCompany(companyId);
    }

    // Regular users only see branches they have readBranches permission for
    return this.companyBranchesService.findAllByCompanyFilteredByPermissions(
      companyId,
      req.user.id,
    );
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

  @CompanyMember()
  @Get(':companyId/admin-manager-users')
  getAdminManagerUsers(
    @Param('companyId') companyId: string,
  ): Promise<AdminManagerUserResponseDto[]> {
    return companiesService.getAdminManagerUsers(
      this.prisma,
      companyId,
    ) as Promise<AdminManagerUserResponseDto[]>;
  }

  // SysAdmin endpoints for managing company limits
  @Admin()
  @Patch(':companyId/limits')
  updateCompanyLimits(
    @Param('companyId') companyId: string,
    @Body(new ZodValidationPipe(UpdateCompanyLimitsSchema))
    updateLimitsDto: UpdateCompanyLimitsDto,
  ) {
    return companiesService.updateCompanyLimits(
      this.prisma,
      companyId,
      updateLimitsDto,
    );
  }

  @CompanyMember()
  @Get(':companyId/usage')
  getCompanyUsageStats(@Param('companyId') companyId: string) {
    return companiesService.getCompanyUsageStats(this.prisma, companyId);
  }
}
