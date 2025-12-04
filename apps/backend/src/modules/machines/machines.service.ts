import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@titans-tech/db';
import { PrismaService } from '../shared/prisma.service';
import {
  CreateMachineDto,
  UpdateMachineDto,
} from '@titans-tech/shared/backend-dtos';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Gets the branch IDs accessible by a user
   * - Company admins/managers: all branches of their company
   * - Regular users: only branches they're assigned to
   */
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

    if (user.isCompanyAdmin || user.isCompanyManager) {
      return user.company.branches.map((b) => b.id);
    }

    return user.branches.map((ub) => ub.branchId);
  }

  /**
   * Validates that a user has access to a specific branch
   */
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

    if (user.isCompanyAdmin || user.isCompanyManager) {
      return;
    }

    if (user.branches.length === 0) {
      throw new ForbiddenException('You do not have access to this branch');
    }
  }

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
    const imageUrl = createMachineDto.imageUrl || blueprint.imageUrl;

    const machine = await this.prisma.machine.create({
      data: {
        blueprintId: createMachineDto.blueprintId,
        branchId: createMachineDto.branchId,
        name: createMachineDto.name,
        imageUrl: imageUrl,
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

  /**
   * Find all machines for a regular user (filtered by their accessible branches)
   */
  async findAll(userId: string): Promise<
    Prisma.MachineGetPayload<{
      include: {
        blueprint: true;
        fields: true;
      };
    }>[]
  > {
    const branchIds = await this.getUserBranchIds(userId);

    return this.prisma.machine.findMany({
      where: {
        branchId: {
          in: branchIds,
        },
      },
      include: {
        blueprint: true,
        branch: true,
        fields: true,
      },
    });
  }

  /**
   * Find all machines for SysAdmin (no filtering)
   */
  async findAllForSysAdmin(): Promise<
    Prisma.MachineGetPayload<{
      include: {
        blueprint: true;
        fields: true;
        branch: {
          include: {
            company: true;
          };
        };
      };
    }>[]
  > {
    return this.prisma.machine.findMany({
      include: {
        blueprint: true,
        branch: {
          include: {
            company: true,
          },
        },
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

  /**
   * Find one machine for a regular user (validates branch access)
   */
  async findOne(
    userId: string,
    id: string,
  ): Promise<
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
            alertClutch: true;
            alertSlide: true;
            alertGibs: true;
            alertPistons: true;
            alertTramming: true;
            alertCounterbalanceCylinderAirbag: true;
          };
        };
      };
    }>
  > {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
      include: {
        blueprint: true,
        branch: {
          include: {
            company: true,
          },
        },
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
            alertClutch: true,
            alertSlide: true,
            alertGibs: true,
            alertPistons: true,
            alertTramming: true,
            alertCounterbalanceCylinderAirbag: true,
          },
        },
      },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    await this.validateUserBranchAccess(userId, machine.branchId);

    return machine;
  }

  /**
   * Find one machine for SysAdmin (no branch validation)
   */
  async findOneForSysAdmin(id: string): Promise<
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
            alertClutch: true;
            alertSlide: true;
            alertGibs: true;
            alertPistons: true;
            alertTramming: true;
            alertCounterbalanceCylinderAirbag: true;
          };
        };
      };
    }>
  > {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
      include: {
        blueprint: true,
        branch: {
          include: {
            company: true,
          },
        },
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
            alertClutch: true,
            alertSlide: true,
            alertGibs: true,
            alertPistons: true,
            alertTramming: true,
            alertCounterbalanceCylinderAirbag: true,
          },
        },
      },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    return machine;
  }

  /**
   * Update a machine for a regular user (validates branch access)
   */
  async update(
    userId: string,
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

    await this.validateUserBranchAccess(userId, existingMachine.branchId);

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
        imageUrl: updateMachineDto.imageUrl,
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

  /**
   * Update a machine for SysAdmin (no branch validation)
   */
  async updateForSysAdmin(
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
        imageUrl: updateMachineDto.imageUrl,
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

  /**
   * Delete a machine for a regular user (validates branch access)
   */
  async delete(userId: string, id: string): Promise<void> {
    // Verify machine exists
    const existingMachine = await this.prisma.machine.findUnique({
      where: { id },
    });

    if (!existingMachine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    await this.validateUserBranchAccess(userId, existingMachine.branchId);

    // Delete the machine (cascade delete will handle fields)
    await this.prisma.machine.delete({
      where: { id },
    });
  }

  /**
   * Delete a machine for SysAdmin (no branch validation)
   */
  async deleteForSysAdmin(id: string): Promise<void> {
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

  /**
   * Get public machine info (no authentication required)
   * Returns only basic info for QR code scanning
   */
  async getPublicInfo(id: string): Promise<{
    id: string;
    name: string;
    serialNumber: string | null;
    imageUrl: string | null;
    company: {
      id: string;
      name: string;
      slug: string;
      brandColor: string | null;
      accentColor: string | null;
    };
    branch: { id: string; name: string };
  }> {
    const machine = await this.prisma.machine.findUnique({
      where: { id },
      include: {
        branch: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!machine) {
      throw new NotFoundException(`Machine with ID ${id} not found`);
    }

    return {
      id: machine.id,
      name: machine.name,
      serialNumber: machine.serialNumber,
      imageUrl: machine.imageUrl,
      company: {
        id: machine.branch.company.id,
        name: machine.branch.company.name,
        slug: machine.branch.company.slug,
        brandColor: machine.branch.company.brandColor,
        accentColor: machine.branch.company.accentColor,
      },
      branch: {
        id: machine.branch.id,
        name: machine.branch.name,
      },
    };
  }
}
