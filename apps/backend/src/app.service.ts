import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {}
  async getHello() {
    return { message: 'Hello World! testing!' + Date.now() };
  }
}
