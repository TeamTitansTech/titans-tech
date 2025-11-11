import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { PrismaService } from '../prisma.service';
import { CreateMachineDto } from './dto/create-machine.dto';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createMachineDto: CreateMachineDto,
  ): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>
  > {
    // Verify blueprint exists
    const blueprint = await this.prisma.blueprint.findUnique({
      where: { id: createMachineDto.blueprintId },
    });

    if (!blueprint) {
      throw new NotFoundException(
        `Blueprint with ID ${createMachineDto.blueprintId} not found`,
      );
    }

    const branch = await this.prisma.companyBranch.findUnique({
      where: { id: createMachineDto.branchId },
    });

    if (!branch) {
      throw new NotFoundException(
        `Branch with ID ${createMachineDto.branchId} not found`,
      );
    }

    const machine = await this.prisma.machine.create({
      data: {
        blueprintId: createMachineDto.blueprintId,
        branchId: createMachineDto.branchId,
        name: createMachineDto.name,
        fields: {
          create: createMachineDto.fields.map((field) => ({
            fieldSlug: field.fieldSlug,
            value: field.value,
          })),
        },
      },
      include: {
        blueprint: true,
        branch: true,
        fields: true,
      },
    });

    return machine;
  }

  async findAll(): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>[]
  > {
    return this.prisma.machine.findMany({
      include: {
        blueprint: true,
        branch: true,
        fields: true,
      },
    });
  }

  async findByBranch(
    branchId: string,
  ): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>[]
  > {
    return this.prisma.machine.findMany({
      where: { branchId },
      include: {
        blueprint: true,
        branch: true,
        fields: true,
      },
    });
  }

  async findOne(id: string): Promise<
    Prisma.MachineGetPayload<{
      include: {
        blueprint: true;
        fields: true;
        services: {
          include: {
            bearingClearance: {
              include: {
                outerBefore: true;
                outerAfter: true;
                innerBefore: true;
                innerAfter: true;
              };
            };
          };
        };
      };
    }>
  > {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
      include: {
        blueprint: true,
        branch: true,
        fields: true,
        services: {
          include: {
            bearingClearance: {
              include: {
                outerBefore: true,
                outerData: true,
                innerBefore: true,
                innerData: true,
              },
            },
          },
        },
      },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    return machine;
  }
}
