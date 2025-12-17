import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClientExtended } from '@titans-tech/db';
@Injectable()
export class PrismaService
  extends PrismaClientExtended
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
