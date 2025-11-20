import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { PrismaService } from '../prisma.service';
import { CreateProductionLineDto } from './dto/create-production-line.dto';
import { UpdateProductionLineDto } from './dto/update-production-line.dto';

@Injectable()
export class ProductionLinesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma nova linha de produção
   * @param createProductionLineDto - Dados para criar a linha de produção
   * @returns Linha de produção criada com as máquinas associadas
   */
  async create(createProductionLineDto: CreateProductionLineDto): Promise<
    Prisma.ProductionLineGetPayload<{
      include: {
        branch: true;
        machines: { include: { machine: true } };
      };
    }>
  > {
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
    }

    const productionLine = await this.prisma.productionLine.create({
      data: {
        name: createProductionLineDto.name,
        branchId: createProductionLineDto.branchId,
        createdBy: createProductionLineDto.createdBy,

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

  /**
   * Busca todas as linhas de produção
   * @returns Lista de todas as linhas de produção
   */
  async findAll(): Promise<
    Prisma.ProductionLineGetPayload<{
      include: {
        branch: true;
        machines: { include: { machine: true } };
      };
    }>[]
  > {
    return this.prisma.productionLine.findMany({
      include: {
        branch: true,
        machines: {
          include: {
            machine: {
              include: {
                blueprint: true,
                fields: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca uma linha de produção específica por ID
   * @param id - ID da linha de produção
   * @returns Linha de produção encontrada
   */
  async findOne(id: string): Promise<
    Prisma.ProductionLineGetPayload<{
      include: {
        branch: true;
        machines: { include: { machine: { include: { blueprint: true } } } };
      };
    }>
  > {
    const productionLine = await this.prisma.productionLine.findUnique({
      where: { id },
      include: {
        branch: true,
        machines: {
          include: {
            machine: {
              include: {
                blueprint: true,
                fields: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!productionLine) {
      throw new NotFoundException(`Production line with ID ${id} not found`);
    }

    return productionLine;
  }

  /**
   * Atualiza uma linha de produção existente
   * @param id - ID da linha de produção
   * @param updateProductionLineDto - Dados para atualizar
   * @returns Linha de produção atualizada
   */
  async update(
    id: string,
    updateProductionLineDto: UpdateProductionLineDto,
  ): Promise<
    Prisma.ProductionLineGetPayload<{
      include: {
        branch: true;
        machines: {
          include: { machine: { include: { blueprint: true; fields: true } } };
        };
      };
    }>
  > {
    const existingLine = await this.prisma.productionLine.findUnique({
      where: { id },
    });

    if (!existingLine) {
      throw new NotFoundException(`Production line with ID ${id} not found`);
    }

    if (updateProductionLineDto.branchId) {
      const branch = await this.prisma.companyBranch.findUnique({
        where: { id: updateProductionLineDto.branchId },
      });

      if (!branch) {
        throw new NotFoundException(
          `Branch with ID ${updateProductionLineDto.branchId} not found`,
        );
      }
    }

    if (updateProductionLineDto.machineIds) {
      if (updateProductionLineDto.machineIds.length > 0) {
        const machines = await this.prisma.machine.findMany({
          where: { id: { in: updateProductionLineDto.machineIds } },
        });

        if (machines.length !== updateProductionLineDto.machineIds.length) {
          throw new NotFoundException('One or more machines not found');
        }
      }

      return this.prisma.productionLine.update({
        where: { id },
        data: {
          name: updateProductionLineDto.name,
          branchId: updateProductionLineDto.branchId,
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
        include: {
          branch: true,
          machines: {
            include: {
              machine: {
                include: {
                  blueprint: true,
                  fields: true,
                },
              },
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    }

    // 5. Se não está atualizando as máquinas, apenas atualizar nome/branch
    return this.prisma.productionLine.update({
      where: { id },
      data: {
        name: updateProductionLineDto.name,
        branchId: updateProductionLineDto.branchId,
      },
      include: {
        branch: true,
        machines: {
          include: {
            machine: {
              include: {
                blueprint: true,
                fields: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  /**
   * Deleta uma linha de produção
   * @param id - ID da linha de produção
   */
  async remove(id: string): Promise<void> {
    // 1. Verificar se a linha de produção existe
    const productionLine = await this.prisma.productionLine.findUnique({
      where: { id },
    });

    if (!productionLine) {
      throw new NotFoundException(`Production line with ID ${id} not found`);
    }

    // 2. Deletar a linha de produção (as relações ProductionLineMachine serão deletadas em cascata)
    await this.prisma.productionLine.delete({
      where: { id },
    });
  }
}
