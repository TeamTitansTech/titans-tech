import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { UsersModule } from '../users/users.module';
import { CompanyBranchesModule } from '../company-branches/company-branches.module';

@Module({
  imports: [UsersModule, CompanyBranchesModule],
  controllers: [CompaniesController],
})
export class CompaniesModule {}
