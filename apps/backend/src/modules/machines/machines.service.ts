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
import { machinesService } from '@titans-tech/shared/services';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createMachineDto: CreateMachineDto,
  ): Promise<
    Prisma.MachineGetPayload<{ include: { blueprint: true; fields: true } }>
  > {
    try {
      return (await machinesService.create(
        this.prisma,
        createMachineDto as any,
      )) as any;
    } catch (err: any) {
      if (err?.type === 'NOT_FOUND') throw new NotFoundException(err.message);
      throw err;
    }
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
    return machinesService.findAll(this.prisma, userId) as any;
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
    return machinesService.findAllForSysAdmin(this.prisma) as any;
  }

  async findByBranch(branchId: string): Promise<
    Prisma.MachineGetPayload<{
      include: {
        blueprint: true;
        fields: true;
      };
    }>[]
  > {
    return machinesService.findByBranch(this.prisma, branchId) as any;
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
            alertSlideSingleHammer: true;
            alertSlideDoubleHammer: true;
            alertGibs: true;
            alertPistons: true;
            alertCounterbalanceCylinderAirbag: true;
            alertTramming: true;
          };
        };
      };
    }>
  > {
    try {
      return (await machinesService.findOne(this.prisma, userId, id)) as any;
    } catch (err: any) {
      if (err?.type === 'NOT_FOUND') throw new NotFoundException(err.message);
      if (err?.type === 'FORBIDDEN') throw new ForbiddenException(err.message);
      throw err;
    }
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
            alertSlideSingleHammer: true;
            alertSlideDoubleHammer: true;
            alertGibs: true;
            alertPistons: true;
            alertCounterbalanceCylinderAirbag: true;
            alertTramming: true;
          };
        };
      };
    }>
  > {
    try {
      return (await machinesService.findOneForSysAdmin(this.prisma, id)) as any;
    } catch (err: any) {
      if (err?.type === 'NOT_FOUND') throw new NotFoundException(err.message);
      throw err;
    }
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
    try {
      const result = (await machinesService.update(
        this.prisma,
        userId,
        id,
        updateMachineDto as any,
      )) as any;
      return result;
    } catch (err: any) {
      if (err?.type === 'NOT_FOUND') throw new NotFoundException(err.message);
      if (err?.type === 'FORBIDDEN') throw new ForbiddenException(err.message);
      throw err;
    }
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
    try {
      return (await machinesService.updateForSysAdmin(
        this.prisma,
        id,
        updateMachineDto as any,
      )) as any;
    } catch (err: any) {
      if (err?.type === 'NOT_FOUND') throw new NotFoundException(err.message);
      throw err;
    }
  }

  /**
   * Delete a machine for a regular user (validates branch access)
   */
  async delete(userId: string, id: string): Promise<void> {
    try {
      await machinesService.delete(this.prisma, userId, id);
    } catch (err: any) {
      if (err?.type === 'NOT_FOUND') throw new NotFoundException(err.message);
      if (err?.type === 'FORBIDDEN') throw new ForbiddenException(err.message);
      throw err;
    }
  }

  /**
   * Delete a machine for SysAdmin (no branch validation)
   * Implements soft delete cascade to all related tables
   */
  async deleteForSysAdmin(id: string): Promise<void> {
    try {
      await machinesService.deleteForSysAdmin(this.prisma, id);
    } catch (err: any) {
      if (err?.type === 'NOT_FOUND') throw new NotFoundException(err.message);
      throw err;
    }
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
    try {
      return (await machinesService.getPublicInfo(this.prisma, id)) as any;
    } catch (err: any) {
      if (err?.type === 'NOT_FOUND') throw new NotFoundException(err.message);
      throw err;
    }
  }
}
