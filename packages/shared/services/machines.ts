import { PrismaClient } from '@titans-tech/db';

function notFound(message: string) {
  return { type: 'NOT_FOUND', message };
}

function forbidden(message: string) {
  return { type: 'FORBIDDEN', message };
}

export const machinesService = {
  async getUserBranchIds(prisma: PrismaClient, userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        branches: { select: { branchId: true } },
        company: { include: { branches: { select: { id: true } } } },
      },
    });

    if (!user) throw notFound('User not found');

    if (user.isCompanyAdmin) return user.company.branches.map((b: any) => b.id);
    return user.branches.map((ub: any) => ub.branchId);
  },

  async validateUserBranchAccess(prisma: PrismaClient, userId: string, branchId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        branches: { where: { branchId } },
        company: { include: { branches: { where: { id: branchId } } } },
      },
    });

    if (!user) throw notFound('User not found');

    if (!user.company || (user.company.branches || []).length === 0) {
      throw forbidden('This branch does not belong to your company');
    }

    if (user.isCompanyAdmin) return;

    if (!user.branches || user.branches.length === 0) {
      throw forbidden('You do not have access to this branch');
    }
  },

  async create(prisma: PrismaClient, createMachineDto: any) {
    const blueprint = await prisma.blueprint.findUnique({
      where: { id: createMachineDto.blueprintId },
    });
    if (!blueprint) throw notFound(`Blueprint with ID ${createMachineDto.blueprintId} not found`);

    const branch = await prisma.companyBranch.findUnique({
      where: { id: createMachineDto.branchId },
    });
    if (!branch) throw notFound(`Branch with ID ${createMachineDto.branchId} not found`);

    const imageUrl = createMachineDto.imageUrl || blueprint.imageUrl;

    const machine = await prisma.machine.create({
      data: {
        blueprintId: createMachineDto.blueprintId,
        branchId: createMachineDto.branchId,
        name: createMachineDto.name,
        imageUrl,
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
          create: (createMachineDto.fields || []).map((f: any) => ({
            fieldSlug: f.fieldSlug,
            value: f.value,
          })),
        },
      },
      include: { blueprint: true, branch: true, fields: true },
    });

    return machine;
  },

  async findAll(prisma: PrismaClient, userId: string) {
    const branchIds = await this.getUserBranchIds(prisma, userId);
    return prisma.machine.findMany({
      where: { branchId: { in: branchIds } },
      include: { blueprint: true, branch: true, fields: true },
    });
  },

  async findAllForSysAdmin(prisma: PrismaClient) {
    return prisma.machine.findMany({
      include: { blueprint: true, branch: { include: { company: true } }, fields: true },
    });
  },

  async findByBranch(prisma: PrismaClient, branchId: string) {
    return prisma.machine.findMany({
      where: { branchId },
      include: { blueprint: true, branch: true, fields: true },
    });
  },

  async findOne(prisma: PrismaClient, userId: string, id: string) {
    const machine = await prisma.machine.findUnique({
      where: { id },
      include: {
        blueprint: true,
        branch: { include: { company: true } },
        fields: true,
        services: {
          where: { status: 'COMPLETED' },
          take: 1,
          orderBy: { date: 'desc' },
          include: {
            bearingClearance: {
              include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
            },
            alertBearingClearance: true,
            alertClutch: true,
            alertSlide: true,
            alertSlideSingleHammer: true,
            alertSlideDoubleHammer: true,
            alertGibs: true,
            alertPistons: true,
            alertCounterbalanceCylinderAirbag: true,
            alertTramming: true,
          },
        },
      },
    });

    if (!machine) throw notFound(`Machine with ID ${id} not found`);

    await this.validateUserBranchAccess(prisma, userId, machine.branchId);

    return machine;
  },

  async findOneForSysAdmin(prisma: PrismaClient, id: string) {
    const machine = await prisma.machine.findUnique({
      where: { id },
      include: {
        blueprint: true,
        branch: { include: { company: true } },
        fields: true,
        services: {
          where: { status: 'COMPLETED' },
          take: 1,
          orderBy: { date: 'desc' },
          include: {
            bearingClearance: {
              include: { outerBefore: true, outerData: true, innerBefore: true, innerData: true },
            },
            alertBearingClearance: true,
            alertClutch: true,
            alertSlide: true,
            alertSlideSingleHammer: true,
            alertSlideDoubleHammer: true,
            alertGibs: true,
            alertPistons: true,
            alertTramming: true,
            alertCounterbalanceCylinderAirbag: true,
          },
        },
      },
    });

    if (!machine) throw notFound(`Machine with ID ${id} not found`);
    return machine;
  },

  async update(prisma: PrismaClient, userId: string, id: string, updateMachineDto: any) {
    const existingMachine = await prisma.machine.findUnique({
      where: { id },
      include: { fields: true },
    });
    if (!existingMachine) throw notFound(`Machine with ID ${id} not found`);

    await this.validateUserBranchAccess(prisma, userId, existingMachine.branchId);

    if (updateMachineDto.blueprintId) {
      const blueprint = await prisma.blueprint.findUnique({
        where: { id: updateMachineDto.blueprintId },
      });
      if (!blueprint) throw notFound(`Blueprint with ID ${updateMachineDto.blueprintId} not found`);
    }

    const machine = await prisma.machine.update({
      where: { id },
      data: {
        name: updateMachineDto.name,
        blueprintId: updateMachineDto.blueprintId,
        imageUrl: updateMachineDto.imageUrl,
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
        ...(updateMachineDto.fields && {
          fields: {
            deleteMany: {},
            create: (updateMachineDto.fields || []).map((f: any) => ({
              fieldSlug: f.fieldSlug,
              value: f.value,
            })),
          },
        }),
      },
      include: { blueprint: true, branch: true, fields: true },
    });

    return machine;
  },

  async updateForSysAdmin(prisma: PrismaClient, id: string, updateMachineDto: any) {
    const existingMachine = await prisma.machine.findUnique({
      where: { id },
      include: { fields: true },
    });
    if (!existingMachine) throw notFound(`Machine with ID ${id} not found`);

    if (updateMachineDto.blueprintId) {
      const blueprint = await prisma.blueprint.findUnique({
        where: { id: updateMachineDto.blueprintId },
      });
      if (!blueprint) throw notFound(`Blueprint with ID ${updateMachineDto.blueprintId} not found`);
    }

    const machine = await prisma.machine.update({
      where: { id },
      data: {
        name: updateMachineDto.name,
        blueprintId: updateMachineDto.blueprintId,
        imageUrl: updateMachineDto.imageUrl,
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
        ...(updateMachineDto.fields && {
          fields: {
            deleteMany: {},
            create: (updateMachineDto.fields || []).map((f: any) => ({
              fieldSlug: f.fieldSlug,
              value: f.value,
            })),
          },
        }),
      },
      include: { blueprint: true, branch: true, fields: true },
    });

    return machine;
  },

  async delete(prisma: PrismaClient, userId: string, id: string) {
    const existingMachine = await prisma.machine.findUnique({ where: { id } });
    if (!existingMachine) throw notFound(`Machine with ID ${id} not found`);

    await this.validateUserBranchAccess(prisma, userId, existingMachine.branchId);

    await prisma.machine.delete({ where: { id } });
    return true;
  },

  async deleteForSysAdmin(prisma: PrismaClient, id: string) {
    const existingMachine = await prisma.machine.findUnique({ where: { id } });
    if (!existingMachine) throw notFound(`Machine with ID ${id} not found`);
    await prisma.machine.delete({ where: { id } });
    return true;
  },

  async getPublicInfo(prisma: PrismaClient, id: string) {
    const machine = await prisma.machine.findUnique({
      where: { id },
      include: { branch: { include: { company: true } } },
    });
    if (!machine) throw notFound(`Machine with ID ${id} not found`);

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
      branch: { id: machine.branch.id, name: machine.branch.name },
    };
  },
};

export default machinesService;
