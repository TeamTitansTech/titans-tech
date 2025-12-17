import { PrismaClient } from './generated/prisma/client';
import { filterSoftDeleted, softDelete, softDeleteMany } from './prisma.extensions';

export const customPrismaClient = (prismaClient: PrismaClient) => {
  return prismaClient.$extends(softDelete).$extends(softDeleteMany).$extends(filterSoftDeleted);
};

export type CustomPrismaClient = ReturnType<typeof customPrismaClient>;

export class PrismaClientExtended extends PrismaClient {
  constructor(options?: ConstructorParameters<typeof PrismaClient>[0]) {
    super(options);
    // Apply extensions to this instance
    return customPrismaClient(this) as this;
  }
}
