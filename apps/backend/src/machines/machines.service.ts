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

    // Create machine with fields
    const machine = await this.prisma.machine.create({
      data: {
        blueprintId: createMachineDto.blueprintId,
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
            bearingClearanceChecks: {
              include: {
                before: true;
                after: true;
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
        fields: true,
        services: {
          include: {
            bearingClearanceChecks: {
              include: {
                before: true,
                after: true,
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
