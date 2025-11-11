import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { PrismaService } from '../prisma.service';
import { CreateInspectionDto } from './dto/create-inspection.dto';

@Injectable()
export class InspectionsService {
  constructor(private prisma: PrismaService) {}

  async create(createInspectionDto: CreateInspectionDto): Promise<
    Prisma.MachineServiceGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearanceChecks: { include: { before: true; after: true } };
      };
    }>
  > {
    // Verify machine exists and get its blueprint
    const machine = await this.prisma.machine.findUnique({
      where: { id: createInspectionDto.machineId },
      include: { blueprint: true },
    });

    if (!machine) {
      throw new NotFoundException(
        `Machine with ID ${createInspectionDto.machineId} not found`,
      );
    }

    // Create the inspection
    const inspection = await this.prisma.machineService.create({
      data: {
        machineId: createInspectionDto.machineId,
        date: new Date(createInspectionDto.date),
        isMaintenance: createInspectionDto.isMaintenance,
        performedBy: createInspectionDto.performedBy,
        bearingClearanceChecks: createInspectionDto.bearingClearance
          ? {
              create: {
                before: createInspectionDto.bearingClearance.before
                  ? {
                      create: createInspectionDto.bearingClearance.before,
                    }
                  : undefined,
                after: createInspectionDto.bearingClearance.after
                  ? {
                      create: createInspectionDto.bearingClearance.after,
                    }
                  : undefined,
              },
            }
          : undefined,
      },
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
          },
        },
        bearingClearanceChecks: {
          include: {
            before: true,
            after: true,
          },
        },
      },
    });

    return inspection;
  }

  async findAll(): Promise<
    Prisma.MachineServiceGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearanceChecks: { include: { before: true; after: true } };
      };
    }>[]
  > {
    return this.prisma.machineService.findMany({
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
          },
        },
        bearingClearanceChecks: {
          include: {
            before: true,
            after: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<
    Prisma.MachineServiceGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearanceChecks: { include: { before: true; after: true } };
      };
    }>
  > {
    const inspection = await this.prisma.machineService.findUnique({
      where: { id },
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
          },
        },
        bearingClearanceChecks: {
          include: {
            before: true,
            after: true,
          },
        },
      },
    });

    if (!inspection) {
      throw new NotFoundException(`Inspection with ID ${id} not found`);
    }

    return inspection;
  }

  async findByMachine(machineId: string): Promise<
    Prisma.MachineServiceGetPayload<{
      include: {
        machine: { include: { blueprint: true; fields: true } };
        bearingClearanceChecks: { include: { before: true; after: true } };
      };
    }>[]
  > {
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${machineId} not found`);
    }

    return this.prisma.machineService.findMany({
      where: { machineId },
      include: {
        machine: {
          include: {
            blueprint: true,
            fields: true,
          },
        },
        bearingClearanceChecks: {
          include: {
            before: true,
            after: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}
