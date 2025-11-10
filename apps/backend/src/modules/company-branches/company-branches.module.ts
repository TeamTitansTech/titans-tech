import { Module } from '@nestjs/common';
import { CompanyBranchesService } from './company-branches.service';
import { CompanyBranchesController } from './company-branches.controller';
import { UsersModule } from '../users/users.module';
import { MachinesModule } from '../../machines/machines.module';

@Module({
  imports: [UsersModule, MachinesModule],
  controllers: [CompanyBranchesController],
  providers: [CompanyBranchesService],
  exports: [CompanyBranchesService],
})
export class CompanyBranchesModule {}
