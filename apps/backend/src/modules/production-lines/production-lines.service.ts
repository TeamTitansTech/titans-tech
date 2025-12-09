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

/**
 * Shared Prisma include for production line queries with full machine details and alerts
 */
const PRODUCTION_LINE_FULL_INCLUDE = {
  branch: true,
  machines: {
    include: {
      machine: {
        include: {
          blueprint: true,
          fields: true,
          services: {
            take: 1,
            orderBy: {
              date: 'desc' as const,
            },
            include: {
              alertBearingClearance: true,
              alertClutch: true,
              alertSlide: true,
              alertGibs: true,
              alertCounterbalanceCylinderAirbag: true,
            },
          },
        },
      },
    },
    orderBy: {
      order: 'asc' as const,
    },
  },
} satisfies Prisma.ProductionLineInclude;

@Injectable()
export class ProductionLinesService {
  constructor(private prisma: PrismaService) {}

  private async validateUserBranchAccess(
    userId: string,
    branchId: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        branches: {
          where: { branchId },
        },
        company: {
          include: {
            branches: {
              where: { id: branchId },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.company.branches.length === 0) {
      throw new ForbiddenException(
        'This branch does not belong to your company',
      );
    }

    if (user.isCompanyAdmin) {
      return;
    }

    if (user.branches.length === 0) {
      throw new ForbiddenException('You do not have access to this branch');
    }
  }

  private async getUserBranchIds(userId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        branches: {
          select: { branchId: true },
        },
        company: {
          include: {
            branches: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isCompanyAdmin) {
      return user.company.branches.map((b) => b.id);
    }

    return user.branches.map((ub) => ub.branchId);
  }

  async create(createProductionLineDto: CreateProductionLineDto): Promise<
    Prisma.ProductionLineGetPayload<{
      include: {
        branch: true;
        machines: { include: { machine: true } };
      };
    }>
  > {
    // Permission check handled by @BranchPermission('createProductionLines') guard
    const branch = await this.prisma.companyBranch.findUnique({
      where: { id: createProductionLineDto.branchId },
    });

    if (!branch) {
      throw new NotFoundException(
        `Branch with ID ${createProductionLineDto.branchId} not found`,
      );
    }

    if (createProductionLineDto.machineIds.length > 0) {
      const machines = await this.prisma.machine.findMany({
        where: { id: { in: createProductionLineDto.machineIds } },
      });

      if (machines.length !== createProductionLineDto.machineIds.length) {
        throw new NotFoundException('One or more machines not found');
      }

      const invalidMachines = machines.filter(
        (machine) => machine.branchId !== createProductionLineDto.branchId,
      );
      if (invalidMachines.length > 0) {
        throw new NotFoundException(
          'All machines must belong to the same branch as the production line',
        );
      }
    }

    const productionLine = await this.prisma.productionLine.create({
      data: {
        name: createProductionLineDto.name,
        branchId: createProductionLineDto.branchId,
        createdBy: createProductionLineDto.createdBy,
        direction: createProductionLineDto.direction,
        machines: {
          create: createProductionLineDto.machineIds.map(
            (machineId, index) => ({
              machineId,
              order: index,
            }),
          ),
        },
      },
      include: {
        branch: true,
        machines: {
          include: {
            machine: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return productionLine;
  }
  async findAll(userId: string) {
    const branchIds = await this.getUserBranchIds(userId);

    return this.prisma.productionLine.findMany({
      where: {
        branchId: {
          in: branchIds,
        },
      },
      include: PRODUCTION_LINE_FULL_INCLUDE,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllForSysAdmin() {
    return this.prisma.productionLine.findMany({
      include: PRODUCTION_LINE_FULL_INCLUDE,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string) {
    const productionLine = await this.prisma.productionLine.findUnique({
      where: { id },
      include: PRODUCTION_LINE_FULL_INCLUDE,
    });

    if (!productionLine) {
      throw new NotFoundException(`Production line with ID ${id} not found`);
    }

    await this.validateUserBranchAccess(userId, productionLine.branchId);
    return productionLine;
  }

  async findOneForSysAdmin(id: string) {
    const productionLine = await this.prisma.productionLine.findUnique({
      where: { id },
      include: PRODUCTION_LINE_FULL_INCLUDE,
    });

    if (!productionLine) {
      throw new NotFoundException(`Production line with ID ${id} not found`);
    }

    return productionLine;
  }

  async update(
    userId: string,
    id: string,
    updateProductionLineDto: UpdateProductionLineDto,
  ) {
    const existingLine = await this.prisma.productionLine.findUnique({
      where: { id },
    });

    if (!existingLine) {
      throw new NotFoundException(`Production line with ID ${id} not found`);
    }

    await this.validateUserBranchAccess(userId, existingLine.branchId);

    if (updateProductionLineDto.machineIds) {
      if (updateProductionLineDto.machineIds.length > 0) {
        const machines = await this.prisma.machine.findMany({
          where: { id: { in: updateProductionLineDto.machineIds } },
        });

        if (machines.length !== updateProductionLineDto.machineIds.length) {
          throw new NotFoundException('One or more machines not found');
        }

        const invalidMachines = machines.filter(
          (machine) => machine.branchId !== existingLine.branchId,
        );
        if (invalidMachines.length > 0) {
          throw new NotFoundException(
            'All machines must belong to the same branch as the production line',
          );
        }
      }

      return this.prisma.productionLine.update({
        where: { id },
        data: {
          name: updateProductionLineDto.name,
          direction: updateProductionLineDto.direction,
          machines: {
            deleteMany: {},
            create: updateProductionLineDto.machineIds.map(
              (machineId, index) => ({
                machineId,
                order: index,
              }),
            ),
          },
        },
        include: PRODUCTION_LINE_FULL_INCLUDE,
      });
    }

    return this.prisma.productionLine.update({
      where: { id },
      data: {
        name: updateProductionLineDto.name,
        direction: updateProductionLineDto.direction,
      },
      include: PRODUCTION_LINE_FULL_INCLUDE,
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    const productionLine = await this.prisma.productionLine.findUnique({
      where: { id },
    });

    if (!productionLine) {
      throw new NotFoundException(`Production line with ID ${id} not found`);
    }

    await this.validateUserBranchAccess(userId, productionLine.branchId);
    await this.prisma.productionLine.delete({
      where: { id },
    });
  }

  async updateForSysAdmin(
    id: string,
    updateProductionLineDto: UpdateProductionLineDto,
  ) {
    const existingLine = await this.prisma.productionLine.findUnique({
      where: { id },
    });

    if (!existingLine) {
      throw new NotFoundException(`Production line with ID ${id} not found`);
    }

    if (updateProductionLineDto.machineIds) {
      if (updateProductionLineDto.machineIds.length > 0) {
        const machines = await this.prisma.machine.findMany({
          where: { id: { in: updateProductionLineDto.machineIds } },
        });

        if (machines.length !== updateProductionLineDto.machineIds.length) {
          throw new NotFoundException('One or more machines not found');
        }

        const invalidMachines = machines.filter(
          (machine) => machine.branchId !== existingLine.branchId,
        );
        if (invalidMachines.length > 0) {
          throw new NotFoundException(
            'All machines must belong to the same branch as the production line',
          );
        }
      }

      return this.prisma.productionLine.update({
        where: { id },
        data: {
          name: updateProductionLineDto.name,
          direction: updateProductionLineDto.direction,
          machines: {
            deleteMany: {},
            create: updateProductionLineDto.machineIds.map(
              (machineId, index) => ({
                machineId,
                order: index,
              }),
            ),
          },
        },
        include: PRODUCTION_LINE_FULL_INCLUDE,
      });
    }

    return this.prisma.productionLine.update({
      where: { id },
      data: {
        name: updateProductionLineDto.name,
        direction: updateProductionLineDto.direction,
      },
      include: PRODUCTION_LINE_FULL_INCLUDE,
    });
  }

  async removeForSysAdmin(id: string): Promise<void> {
    const productionLine = await this.prisma.productionLine.findUnique({
      where: { id },
    });

    if (!productionLine) {
      throw new NotFoundException(`Production line with ID ${id} not found`);
    }

    await this.prisma.productionLine.delete({
      where: { id },
    });
  }
}
