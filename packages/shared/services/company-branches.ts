import { PrismaClient, Prisma } from '@titans-tech/db';
import {
  CreateCompanyBranchDto,
  UpdateCompanyBranchDto,
  SetUserPermissionsDto,
} from '@titans-tech/shared/backend-dtos';

export type GetMachinesResult = Prisma.MachineGetPayload<{
  include: { blueprint: true; fields: true };
}>[];

export const companyBranchesService = {
  async findAll(prisma: PrismaClient) {
    return prisma.companyBranch.findMany({
      include: {
        company: { select: { id: true, name: true } },
        _count: { select: { machines: true } },
      },
      orderBy: [{ company: { name: 'asc' } }, { name: 'asc' }],
    });
  },

  async findAllByCompany(prisma: PrismaClient, companyId: string) {
    return prisma.companyBranch.findMany({
      where: { companyId },
      include: { _count: { select: { machines: true, users: true } } },
    });
  },

  async findOne(prisma: PrismaClient, id: string) {
    return prisma.companyBranch.findUnique({
      where: { id },
      include: { _count: { select: { machines: true } } },
    });
  },

  async create(prisma: PrismaClient, companyId: string, createBranchDto: CreateCompanyBranchDto) {
    if (createBranchDto.isMainBranch) {
      return prisma.$transaction(async (tx) => {
        await tx.companyBranch.updateMany({
          where: { companyId, isMainBranch: true },
          data: { isMainBranch: false },
        });
        return tx.companyBranch.create({ data: { ...createBranchDto, companyId } });
      });
    }

    return prisma.companyBranch.create({ data: { ...createBranchDto, companyId } });
  },

  async update(prisma: PrismaClient, id: string, updateBranchDto: UpdateCompanyBranchDto) {
    const branch = await prisma.companyBranch.findUnique({ where: { id } });
    if (!branch) return null;

    if (updateBranchDto.isMainBranch === true) {
      return prisma.$transaction(async (tx) => {
        await tx.companyBranch.updateMany({
          where: { companyId: branch.companyId, isMainBranch: true, ...(id && { NOT: { id } }) },
          data: { isMainBranch: false },
        });
        return tx.companyBranch.update({ where: { id }, data: updateBranchDto });
      });
    }

    return prisma.companyBranch.update({ where: { id }, data: updateBranchDto });
  },

  async remove(prisma: PrismaClient, id: string) {
    const branch = await prisma.companyBranch.findUnique({ where: { id } });
    if (!branch) return null;
    await prisma.companyBranch.delete({ where: { id } });
    return true;
  },

  async getMachines(prisma: PrismaClient, branchId: string): Promise<GetMachinesResult | null> {
    const branch = await prisma.companyBranch.findUnique({
      where: { id: branchId },
      include: { machines: { include: { blueprint: true, fields: true } } },
    });
    if (!branch) return null;
    return branch.machines as any;
  },

  async setUserPermissions(
    prisma: PrismaClient,
    branchId: string,
    userId: string,
    permissionsDto: SetUserPermissionsDto,
  ) {
    const userBranch = await prisma.userBranch.findUnique({
      where: { userId_branchId: { userId, branchId } },
    });
    if (!userBranch) return null;

    await prisma.userBranch.update({
      where: { userId_branchId: { userId, branchId } },
      data: permissionsDto,
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { branches: { include: { branch: true } } },
    });

    return updatedUser;
  },
};

export default companyBranchesService;
