import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Request,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import {
  CreateCompanyDto,
  CreateCompanySchema,
  UpdateCompanyDto,
  UpdateCompanySchema,
} from '@titans-tech/shared';
import { ZodValidationPipe } from '../../errors/zod-validation.pipe';
import { Admin, BranchPermission } from '../auth/auth.decorators';
import { ReqWithAuthUser } from '../../types/request';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

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
}
