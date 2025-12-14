import { Prisma } from './generated/prisma/client';

// Extension for soft delete
export const softDelete = Prisma.defineExtension({
  name: 'softDelete',
  model: {
    $allModels: {
      async delete<M, A>(
        this: M,
        data: Prisma.Args<M, 'delete'>,
      ): Promise<Prisma.Result<M, A, 'update'>> {
        const context = Prisma.getExtensionContext(this);

        return (context as any).update({
          where: data.where,
          data: {
            deletedAt: new Date(),
          },
        });
      },
    },
  },
});

// Extension for soft delete many
export const softDeleteMany = Prisma.defineExtension({
  name: 'softDeleteMany',
  model: {
    $allModels: {
      async deleteMany<M, A>(
        this: M,
        data: Prisma.Args<M, 'deleteMany'>,
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        const context = Prisma.getExtensionContext(this);

        return (context as any).updateMany({
          where: data.where,
          data: {
            deletedAt: new Date(),
          },
        });
      },
    },
  },
});

// Extension for filtering soft deleted rows from queries
export const filterSoftDeleted = Prisma.defineExtension({
  name: 'filterSoftDeleted',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (operation === 'findUnique' || operation === 'findFirst' || operation === 'findMany') {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        }
        return query(args);
      },
    },
  },
});
