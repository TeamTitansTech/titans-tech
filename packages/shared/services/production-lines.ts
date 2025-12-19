import { PrismaClient, Prisma } from '@titans-tech/db';
import { CreateProductionLineDto, UpdateProductionLineDto } from '@titans-tech/shared/backend-dtos';

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
              alertSlideSingleHammer: true,
              alertSlideDoubleHammer: true,
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

/**
 * Get user's accessible branch IDs
 * Returns all company branches if user is company admin, otherwise returns assigned branches
 */
export async function getUserBranchIds(
  prisma: PrismaClient,
  userId: string,
): Promise<string[] | null> {
  const user = await prisma.user.findUnique({
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
    return null;
  }

  if (user.isCompanyAdmin) {
    return user.company.branches.map((b) => b.id);
  }

  return user.branches.map((ub) => ub.branchId);
}

/**
 * Validate that user has access to a branch
 * Returns { allowed: true } or { allowed: false, reason: string }
 */
export async function validateUserBranchAccess(
  prisma: PrismaClient,
  userId: string,
  branchId: string,
): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  const user = await prisma.user.findUnique({
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
    return { allowed: false, reason: 'User not found' };
  }

  if (user.company.branches.length === 0) {
    return {
      allowed: false,
      reason: 'This branch does not belong to your company',
    };
  }

  if (user.isCompanyAdmin) {
    return { allowed: true };
  }

  if (user.branches.length === 0) {
    return { allowed: false, reason: 'You do not have access to this branch' };
  }

  return { allowed: true };
}

/**
 * Create a new production line with machines
 */
export async function createProductionLine(
  prisma: PrismaClient,
  dto: CreateProductionLineDto,
): Promise<{
  data: Prisma.ProductionLineGetPayload<{
    include: {
      branch: true;
      machines: { include: { machine: true } };
    };
  }> | null;
  error?: { type: string; message: string };
}> {
  const branch = await prisma.companyBranch.findUnique({
    where: { id: dto.branchId },
  });

  if (!branch) {
    return {
      data: null,
      error: {
        type: 'NOT_FOUND',
        message: `Branch with ID ${dto.branchId} not found`,
      },
    };
  }

  if (dto.machineIds.length > 0) {
    const machines = await prisma.machine.findMany({
      where: { id: { in: dto.machineIds } },
    });

    if (machines.length !== dto.machineIds.length) {
      return {
        data: null,
        error: { type: 'NOT_FOUND', message: 'One or more machines not found' },
      };
    }

    const invalidMachines = machines.filter((machine) => machine.branchId !== dto.branchId);
    if (invalidMachines.length > 0) {
      return {
        data: null,
        error: {
          type: 'VALIDATION_ERROR',
          message: 'All machines must belong to the same branch as the production line',
        },
      };
    }
  }

  const productionLine = await prisma.productionLine.create({
    data: {
      name: dto.name,
      branchId: dto.branchId,
      createdBy: dto.createdBy,
      direction: dto.direction,
      machines: {
        create: dto.machineIds.map((machineId, index) => ({
          machineId,
          order: index,
        })),
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

  return { data: productionLine };
}

/**
 * Find all production lines for user (respects permissions)
 */
export async function findAllProductionLines(
  prisma: PrismaClient,
  userId: string,
): Promise<
  | Prisma.ProductionLineGetPayload<{
      include: typeof PRODUCTION_LINE_FULL_INCLUDE;
    }>[]
  | null
> {
  const branchIds = await getUserBranchIds(prisma, userId);

  if (branchIds === null) {
    return null;
  }

  return prisma.productionLine.findMany({
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

/**
 * Find all production lines (sys admin - no restrictions)
 */
export async function findAllProductionLinesForSysAdmin(prisma: PrismaClient): Promise<
  Prisma.ProductionLineGetPayload<{
    include: typeof PRODUCTION_LINE_FULL_INCLUDE;
  }>[]
> {
  return prisma.productionLine.findMany({
    include: PRODUCTION_LINE_FULL_INCLUDE,
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Find one production line by ID (with user permission check)
 */
export async function findOneProductionLine(
  prisma: PrismaClient,
  userId: string,
  id: string,
): Promise<{
  data: Prisma.ProductionLineGetPayload<{
    include: typeof PRODUCTION_LINE_FULL_INCLUDE;
  }> | null;
  error?: { type: string; message: string };
}> {
  const productionLine = await prisma.productionLine.findUnique({
    where: { id },
    include: PRODUCTION_LINE_FULL_INCLUDE,
  });

  if (!productionLine) {
    return {
      data: null,
      error: {
        type: 'NOT_FOUND',
        message: `Production line with ID ${id} not found`,
      },
    };
  }

  const validation = await validateUserBranchAccess(prisma, userId, productionLine.branchId);

  if (!validation.allowed) {
    return {
      data: null,
      error: { type: 'FORBIDDEN', message: (validation as any).reason },
    };
  }

  return { data: productionLine };
}

/**
 * Find one production line by ID (sys admin - no restrictions)
 */
export async function findOneProductionLineSysAdmin(
  prisma: PrismaClient,
  id: string,
): Promise<{
  data: Prisma.ProductionLineGetPayload<{
    include: typeof PRODUCTION_LINE_FULL_INCLUDE;
  }> | null;
  error?: { type: string; message: string };
}> {
  const productionLine = await prisma.productionLine.findUnique({
    where: { id },
    include: PRODUCTION_LINE_FULL_INCLUDE,
  });

  if (!productionLine) {
    return {
      data: null,
      error: {
        type: 'NOT_FOUND',
        message: `Production line with ID ${id} not found`,
      },
    };
  }

  return { data: productionLine };
}

/**
 * Update production line (with user permission check)
 */
export async function updateProductionLine(
  prisma: PrismaClient,
  userId: string,
  id: string,
  dto: UpdateProductionLineDto,
): Promise<{
  data: Prisma.ProductionLineGetPayload<{
    include: typeof PRODUCTION_LINE_FULL_INCLUDE;
  }> | null;
  error?: { type: string; message: string };
}> {
  const existingLine = await prisma.productionLine.findUnique({
    where: { id },
  });

  if (!existingLine) {
    return {
      data: null,
      error: {
        type: 'NOT_FOUND',
        message: `Production line with ID ${id} not found`,
      },
    };
  }

  const validation = await validateUserBranchAccess(prisma, userId, existingLine.branchId);

  if (!validation.allowed) {
    return {
      data: null,
      error: { type: 'FORBIDDEN', message: (validation as any).reason },
    };
  }

  if (dto.machineIds) {
    if (dto.machineIds.length > 0) {
      const machines = await prisma.machine.findMany({
        where: { id: { in: dto.machineIds } },
      });

      if (machines.length !== dto.machineIds.length) {
        return {
          data: null,
          error: {
            type: 'NOT_FOUND',
            message: 'One or more machines not found',
          },
        };
      }

      const invalidMachines = machines.filter(
        (machine) => machine.branchId !== existingLine.branchId,
      );
      if (invalidMachines.length > 0) {
        return {
          data: null,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'All machines must belong to the same branch as the production line',
          },
        };
      }
    }

    const updated = await prisma.productionLine.update({
      where: { id },
      data: {
        name: dto.name,
        direction: dto.direction,
        machines: {
          deleteMany: {},
          create: dto.machineIds.map((machineId, index) => ({
            machineId,
            order: index,
          })),
        },
      },
      include: PRODUCTION_LINE_FULL_INCLUDE,
    });

    return { data: updated };
  }

  const updated = await prisma.productionLine.update({
    where: { id },
    data: {
      name: dto.name,
      direction: dto.direction,
    },
    include: PRODUCTION_LINE_FULL_INCLUDE,
  });

  return { data: updated };
}

/**
 * Update production line (sys admin - no permission check)
 */
export async function updateProductionLineSysAdmin(
  prisma: PrismaClient,
  id: string,
  dto: UpdateProductionLineDto,
): Promise<{
  data: Prisma.ProductionLineGetPayload<{
    include: typeof PRODUCTION_LINE_FULL_INCLUDE;
  }> | null;
  error?: { type: string; message: string };
}> {
  const existingLine = await prisma.productionLine.findUnique({
    where: { id },
  });

  if (!existingLine) {
    return {
      data: null,
      error: {
        type: 'NOT_FOUND',
        message: `Production line with ID ${id} not found`,
      },
    };
  }

  if (dto.machineIds) {
    if (dto.machineIds.length > 0) {
      const machines = await prisma.machine.findMany({
        where: { id: { in: dto.machineIds } },
      });

      if (machines.length !== dto.machineIds.length) {
        return {
          data: null,
          error: {
            type: 'NOT_FOUND',
            message: 'One or more machines not found',
          },
        };
      }

      const invalidMachines = machines.filter(
        (machine) => machine.branchId !== existingLine.branchId,
      );
      if (invalidMachines.length > 0) {
        return {
          data: null,
          error: {
            type: 'VALIDATION_ERROR',
            message: 'All machines must belong to the same branch as the production line',
          },
        };
      }
    }

    const updated = await prisma.productionLine.update({
      where: { id },
      data: {
        name: dto.name,
        direction: dto.direction,
        machines: {
          deleteMany: {},
          create: dto.machineIds.map((machineId, index) => ({
            machineId,
            order: index,
          })),
        },
      },
      include: PRODUCTION_LINE_FULL_INCLUDE,
    });

    return { data: updated };
  }

  const updated = await prisma.productionLine.update({
    where: { id },
    data: {
      name: dto.name,
      direction: dto.direction,
    },
    include: PRODUCTION_LINE_FULL_INCLUDE,
  });

  return { data: updated };
}

/**
 * Delete production line (with user permission check)
 */
export async function deleteProductionLine(
  prisma: PrismaClient,
  userId: string,
  id: string,
): Promise<{ error?: { type: string; message: string } }> {
  const productionLine = await prisma.productionLine.findUnique({
    where: { id },
  });

  if (!productionLine) {
    return {
      error: {
        type: 'NOT_FOUND',
        message: `Production line with ID ${id} not found`,
      },
    };
  }

  const validation = await validateUserBranchAccess(prisma, userId, productionLine.branchId);

  if (!validation.allowed) {
    return {
      error: { type: 'FORBIDDEN', message: (validation as any).reason },
    };
  }

  await prisma.productionLine.delete({
    where: { id },
  });

  return {};
}

/**
 * Delete production line (sys admin - no permission check)
 */
export async function deleteProductionLineSysAdmin(
  prisma: PrismaClient,
  id: string,
): Promise<{ error?: { type: string; message: string } }> {
  const productionLine = await prisma.productionLine.findUnique({
    where: { id },
  });

  if (!productionLine) {
    return {
      error: {
        type: 'NOT_FOUND',
        message: `Production line with ID ${id} not found`,
      },
    };
  }

  await prisma.productionLine.delete({
    where: { id },
  });

  return {};
}
