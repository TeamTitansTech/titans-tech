import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CompanyLimitsService } from './company-limits.service';

@Global()
@Module({
  providers: [PrismaService, CompanyLimitsService],
  exports: [PrismaService, CompanyLimitsService],
})
export class SharedModule {}
