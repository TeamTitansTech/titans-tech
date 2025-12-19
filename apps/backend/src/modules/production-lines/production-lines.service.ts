import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateProductionLineDto,
  UpdateProductionLineDto,
} from '@titans-tech/shared/backend-dtos';
import { productionLinesService } from '@titans-tech/shared/services';

@Injectable()
export class ProductionLinesService {
  constructor(private prisma: PrismaService) {}

  async create(createProductionLineDto: CreateProductionLineDto): Promise<
    Prisma.ProductionLineGetPayload<{
      include: {
        branch: true;
        machines: { include: { machine: true } };
      };
    }>
  > {
    // Permission check handled by @BranchPermission('createProductionLines') guard
    const result = await productionLinesService.createProductionLine(
      this.prisma,
      createProductionLineDto,
    );

    if (result.error) {
      if (result.error.type === 'NOT_FOUND') {
        throw new NotFoundException(result.error.message);
      }
      if (result.error.type === 'VALIDATION_ERROR') {
        throw new ForbiddenException(result.error.message);
      }
    }

    return result.data!;
  }
  async findAll(userId: string) {
    const result = await productionLinesService.findAllProductionLines(
      this.prisma,
      userId,
    );

    if (result === null) {
      throw new NotFoundException('User not found');
    }

    return result;
  }

  async findAllForSysAdmin() {
    return await productionLinesService.findAllProductionLinesForSysAdmin(
      this.prisma,
    );
  }

  async findOne(userId: string, id: string) {
    const result = await productionLinesService.findOneProductionLine(
      this.prisma,
      userId,
      id,
    );

    if (result.error) {
      if (result.error.type === 'NOT_FOUND') {
        throw new NotFoundException(result.error.message);
      }
      if (result.error.type === 'FORBIDDEN') {
        throw new ForbiddenException(result.error.message);
      }
    }

    return result.data!;
  }

  async findOneForSysAdmin(id: string) {
    const result = await productionLinesService.findOneProductionLineSysAdmin(
      this.prisma,
      id,
    );

    if (result.error) {
      throw new NotFoundException(result.error.message);
    }

    return result.data!;
  }

  async update(
    userId: string,
    id: string,
    updateProductionLineDto: UpdateProductionLineDto,
  ) {
    const result = await productionLinesService.updateProductionLine(
      this.prisma,
      userId,
      id,
      updateProductionLineDto,
    );

    if (result.error) {
      if (result.error.type === 'NOT_FOUND') {
        throw new NotFoundException(result.error.message);
      }
      if (result.error.type === 'FORBIDDEN') {
        throw new ForbiddenException(result.error.message);
      }
      if (result.error.type === 'VALIDATION_ERROR') {
        throw new ForbiddenException(result.error.message);
      }
    }

    return result.data!;
  }

  async remove(userId: string, id: string): Promise<void> {
    const result = await productionLinesService.deleteProductionLine(
      this.prisma,
      userId,
      id,
    );

    if (result.error) {
      if (result.error.type === 'NOT_FOUND') {
        throw new NotFoundException(result.error.message);
      }
      if (result.error.type === 'FORBIDDEN') {
        throw new ForbiddenException(result.error.message);
      }
    }
  }

  async updateForSysAdmin(
    id: string,
    updateProductionLineDto: UpdateProductionLineDto,
  ) {
    const result = await productionLinesService.updateProductionLineSysAdmin(
      this.prisma,
      id,
      updateProductionLineDto,
    );

    if (result.error) {
      if (result.error.type === 'NOT_FOUND') {
        throw new NotFoundException(result.error.message);
      }
      if (result.error.type === 'VALIDATION_ERROR') {
        throw new ForbiddenException(result.error.message);
      }
    }

    return result.data!;
  }

  async removeForSysAdmin(id: string): Promise<void> {
    const result = await productionLinesService.deleteProductionLineSysAdmin(
      this.prisma,
      id,
    );

    if (result.error) {
      throw new NotFoundException(result.error.message);
    }
  }
}
