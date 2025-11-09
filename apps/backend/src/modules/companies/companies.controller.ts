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
} from '@titans-tech/shared';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { Admin, BranchPermission } from '../auth/auth.decorators';
import { ReqWithAuthUser } from '../../types/request';
import { UsersService } from '../users/users.service';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly usersService: UsersService,
  ) {}

  @Admin()
  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @BranchPermission('read')
  @Get('single')
  findOne(@Request() req: ReqWithAuthUser) {
    return this.companiesService.findOne(req.companyId);
  }

  @Admin()
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateCompanySchema))
    createCompanyDto: CreateCompanyDto,
  ) {
    return this.companiesService.create(createCompanyDto);
  }

  @Patch('single')
  @BranchPermission('read')
  update(
    @Body(new ZodValidationPipe(UpdateCompanySchema))
    updateCompanyDto: UpdateCompanyDto,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.companiesService.update(req.companyId, updateCompanyDto);
  }

  @Admin()
  @Delete('single')
  remove(@Request() req: ReqWithAuthUser) {
    return this.companiesService.remove(req.companyId);
  }

  @Admin()
  @Post('users')
  createUser(
    @Body(new ZodValidationPipe(SysAdminCreateUserSchema))
    createUserDto: SysAdminCreateUserDto,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.usersService.sysAdminCreateUser(req.companyId, createUserDto);
  }

  @BranchPermission('read')
  @Get('users')
  findAllUsers(@Request() req: ReqWithAuthUser) {
    return this.usersService.findAll(req.companyId);
  }

  @BranchPermission('updateUser')
  @Patch('users/:userId')
  updateUser(
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) updateUserDto: UpdateUserDto,
    @Request() req: ReqWithAuthUser,
  ) {
    return this.usersService.update(
      userId,
      req.companyId,
      updateUserDto,
      req.user,
    );
  }

  @BranchPermission('deleteUser')
  @Delete('users/:userId')
  removeUser(@Param('userId') userId: string, @Request() req: ReqWithAuthUser) {
    return this.usersService.remove(userId, req.companyId);
  }
}
