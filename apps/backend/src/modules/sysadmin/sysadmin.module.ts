import { Module } from '@nestjs/common';
import { SysAdminController } from './sysadmin.controller';
import { SysAdminService } from './sysadmin.service';

@Module({
  controllers: [SysAdminController],
  providers: [SysAdminService],
})
export class SysAdminModule {}
