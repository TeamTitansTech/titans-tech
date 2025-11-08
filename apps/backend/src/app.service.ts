import { Injectable } from '@nestjs/common';
import { PrismaService } from './modules/shared/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  async getHello() {
    const user = await this.prisma.user.create({
      data: {
        email: 'test@example.com' + Date.now(),
        name: 'Test User' + Date.now(),
        password: 'password',
      },
    });
    return { message: user.name };
  }
}
