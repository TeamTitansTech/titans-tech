import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { PrismaService } from '../prisma.service';
import {
  CreateMachineDto,
  UpdateMachineDto,
} from '@titans-tech/shared/backend-dtos';

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
        manufacturer: createMachineDto.manufacturer,
        sizeTonnage: createMachineDto.sizeTonnage,
        serialNumber: createMachineDto.serialNumber,
        stroke: createMachineDto.stroke,
        foundationType: createMachineDto.foundationType,
        frameType: createMachineDto.frameType,
        clutchType: createMachineDto.clutchType,
        pneumaticSystem: createMachineDto.pneumaticSystem,
        pressMounting: createMachineDto.pressMounting,
        features: createMachineDto.features,
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
    Prisma.MachineGetPayload<{
      include: {
        blueprint: true;
        fields: true;
      };
    }>[]
  > {
    return this.prisma.machine.findMany({
      include: {
        blueprint: true,
        branch: true,
        fields: true,
      },
    });
  }

  async findByBranch(branchId: string): Promise<
    Prisma.MachineGetPayload<{
      include: {
        blueprint: true;
        fields: true;
      };
    }>[]
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
            alertBearingClearance: true;
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
          take: 1,
          orderBy: { date: 'desc' },
          include: {
            bearingClearance: {
              include: {
                outerBefore: true,
                outerData: true,
                innerBefore: true,
                innerData: true,
              },
            },
            alertBearingClearance: true,
          },
        },
      },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    return machine;
  }

  async update(
    id: string,
    updateMachineDto: UpdateMachineDto,
  ): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>
  > {
    // Verify machine exists
    const existingMachine = await this.prisma.machine.findUnique({
      where: { id },
      include: { fields: true },
    });

    if (!existingMachine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    // If blueprintId is being updated, verify it exists
    if (updateMachineDto.blueprintId) {
      const blueprint = await this.prisma.blueprint.findUnique({
        where: { id: updateMachineDto.blueprintId },
      });

      if (!blueprint) {
        throw new NotFoundException(
          `Blueprint with ID ${updateMachineDto.blueprintId} not found`,
        );
      }
    }

    // Update machine with specifications and fields
    const machine = await this.prisma.machine.update({
      where: { id },
      data: {
        name: updateMachineDto.name,
        blueprintId: updateMachineDto.blueprintId,
        // Machine specifications
        manufacturer: updateMachineDto.manufacturer,
        sizeTonnage: updateMachineDto.sizeTonnage,
        serialNumber: updateMachineDto.serialNumber,
        stroke: updateMachineDto.stroke,
        foundationType: updateMachineDto.foundationType,
        frameType: updateMachineDto.frameType,
        clutchType: updateMachineDto.clutchType,
        pneumaticSystem: updateMachineDto.pneumaticSystem,
        pressMounting: updateMachineDto.pressMounting,
        features: updateMachineDto.features,
        // Update fields if provided
        ...(updateMachineDto.fields && {
          fields: {
            deleteMany: {},
            create: updateMachineDto.fields.map((field) => ({
              fieldSlug: field.fieldSlug,
              value: field.value,
            })),
          },
        }),
      },
      include: {
        blueprint: true,
        branch: true,
        fields: true,
      },
    });

    return machine;
  }

  async delete(id: string): Promise<void> {
    // Verify machine exists
    const existingMachine = await this.prisma.machine.findUnique({
      where: { id },
    });

    if (!existingMachine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    // Delete the machine (cascade delete will handle fields)
    await this.prisma.machine.delete({
      where: { id },
    });
  }
}
