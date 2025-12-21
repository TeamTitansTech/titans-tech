import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompanyLimitsService } from './company-limits.service';
import { UsersModule } from '../users/users.module';
import { CompanyBranchesModule } from '../company-branches/company-branches.module';

@Module({
  imports: [UsersModule, CompanyBranchesModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyLimitsService],
  exports: [CompaniesService, CompanyLimitsService],
})
export class CompaniesModule {}
