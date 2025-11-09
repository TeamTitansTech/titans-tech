import { Module } from '@nestjs/common';
import { CompanyBranchesService } from './company-branches.service';
import { CompanyBranchesController } from './company-branches.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CompanyBranchesController],
  providers: [CompanyBranchesService],
  exports: [CompanyBranchesService],
})
export class CompanyBranchesModule {}
