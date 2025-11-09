import { Module } from '@nestjs/common';
import { CompanyBranchesService } from './company-branches.service';
import { CompanyBranchesController } from './company-branches.controller';

@Module({
  controllers: [CompanyBranchesController],
  providers: [CompanyBranchesService],
  exports: [CompanyBranchesService],
})
export class CompanyBranchesModule {}
