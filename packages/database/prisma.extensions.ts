import { Prisma } from './generated/prisma/client';

// Models that support soft delete
const SOFT_DELETE_MODELS = [
  'User',
  'UserBranch',
  // 'Company',
  // 'CompanyBranch',
  // 'MachineService',
  // 'ProductionLine',
  // 'Machine',
  // 'PermissionTemplate',
] as const;

type SoftDeleteModel = (typeof SOFT_DELETE_MODELS)[number];

function isSoftDeleteModel(model: string): model is SoftDeleteModel {
  return SOFT_DELETE_MODELS.includes(model as SoftDeleteModel);
}

// Shared soft delete handler
async function softDeleteHandler<M, A>(
  context: any,
  data: Prisma.Args<M, 'delete'>,
): Promise<Prisma.Result<M, A, 'update'>> {
  return context.update({
    where: data.where,
    data: {
      deletedAt: new Date(),
    },
  });
}

// Shared soft delete many handler
async function softDeleteManyHandler<M, A>(
  context: any,
  data: Prisma.Args<M, 'deleteMany'>,
): Promise<Prisma.Result<M, A, 'updateMany'>> {
  return context.updateMany({
    where: data.where,
    data: {
      deletedAt: new Date(),
    },
  });
}

// Extension for soft delete
export const softDelete = Prisma.defineExtension({
  name: 'softDelete',
  model: {
    user: {
      async delete<M, A>(
        this: M,
        data: Prisma.Args<M, 'delete'>,
      ): Promise<Prisma.Result<M, A, 'update'>> {
        return softDeleteHandler(Prisma.getExtensionContext(this), data);
      },
    },
    userBranch: {
      async delete<M, A>(
        this: M,
        data: Prisma.Args<M, 'delete'>,
      ): Promise<Prisma.Result<M, A, 'update'>> {
        return softDeleteHandler(Prisma.getExtensionContext(this), data);
      },
    },
    // company: {
    //   async delete<M, A>(
    //     this: M,
    //     data: Prisma.Args<M, 'delete'>,
    //   ): Promise<Prisma.Result<M, A, 'update'>> {
    //     return softDeleteHandler(Prisma.getExtensionContext(this), data);
    //   },
    // },
    // companyBranch: {
    //   async delete<M, A>(
    //     this: M,
    //     data: Prisma.Args<M, 'delete'>,
    //   ): Promise<Prisma.Result<M, A, 'update'>> {
    //     return softDeleteHandler(Prisma.getExtensionContext(this), data);
    //   },
    // },
    // machineService: {
    //   async delete<M, A>(
    //     this: M,
    //     data: Prisma.Args<M, 'delete'>,
    //   ): Promise<Prisma.Result<M, A, 'update'>> {
    //     return softDeleteHandler(Prisma.getExtensionContext(this), data);
    //   },
    // },
    // productionLine: {
    //   async delete<M, A>(
    //     this: M,
    //     data: Prisma.Args<M, 'delete'>,
    //   ): Promise<Prisma.Result<M, A, 'update'>> {
    //     return softDeleteHandler(Prisma.getExtensionContext(this), data);
    //   },
    // },
    // machine: {
    //   async delete<M, A>(
    //     this: M,
    //     data: Prisma.Args<M, 'delete'>,
    //   ): Promise<Prisma.Result<M, A, 'update'>> {
    //     return softDeleteHandler(Prisma.getExtensionContext(this), data);
    //   },
    // },
    // permissionTemplate: {
    //   async delete<M, A>(
    //     this: M,
    //     data: Prisma.Args<M, 'delete'>,
    //   ): Promise<Prisma.Result<M, A, 'update'>> {
    //     return softDeleteHandler(Prisma.getExtensionContext(this), data);
    //   },
    // },
  },
});

// Extension for soft delete many
export const softDeleteMany = Prisma.defineExtension({
  name: 'softDeleteMany',
  model: {
    user: {
      async deleteMany<M, A>(
        this: M,
        data: Prisma.Args<M, 'deleteMany'>,
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
      },
    },
    userBranch: {
      async deleteMany<M, A>(
        this: M,
        data: Prisma.Args<M, 'deleteMany'>,
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
      },
    },
    // company: {
    //   async deleteMany<M, A>(
    //     this: M,
    //     data: Prisma.Args<M, 'deleteMany'>,
    //   ): Promise<Prisma.Result<M, A, 'updateMany'>> {
    //     return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
    //   },
    // },
    // companyBranch: {
    //   async deleteMany<M, A>(
    //     this: M,
    //     data: Prisma.Args<M, 'deleteMany'>,
    //   ): Promise<Prisma.Result<M, A, 'updateMany'>> {
    //     return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
    //   },
    // },
    // machineService: {
    //   async deleteMany<M, A>(
    //     this: M,
    //     data: Prisma.Args<M, 'deleteMany'>,
    //   ): Promise<Prisma.Result<M, A, 'updateMany'>> {
    //     return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
    //   },
    // },
    // productionLine: {
    //   async deleteMany<M, A>(
    //     this: M,
    //     data: Prisma.Args<M, 'deleteMany'>,
    //   ): Promise<Prisma.Result<M, A, 'updateMany'>> {
    //     return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
    //   },
    // },
    // machine: {
    //   async deleteMany<M, A>(
    //     this: M,
    //     data: Prisma.Args<M, 'deleteMany'>,
    //   ): Promise<Prisma.Result<M, A, 'updateMany'>> {
    //     return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
    //   },
    // },
    // permissionTemplate: {
    //   async deleteMany<M, A>(
    //     this: M,
    //     data: Prisma.Args<M, 'deleteMany'>,
    //   ): Promise<Prisma.Result<M, A, 'updateMany'>> {
    //     return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
    //   },
    // },
  },
});

// Extension for filtering soft deleted rows from queries
export const filterSoftDeleted = Prisma.defineExtension({
  name: 'filterSoftDeleted',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        if (operation === 'findUnique' || operation === 'findFirst' || operation === 'findMany') {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        }
        return query(args);
      },
    },
  },
});
