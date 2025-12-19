import { Prisma } from './generated/prisma/client';

// Models that support soft delete
const SOFT_DELETE_MODELS = [
  'User',
  'UserBranch',
  'Machine',
  'MachineService',
  'MachineField',
  'ServiceRequest',
  'MachineProductionLine',
  'CompanyBranch',
  'ProductionLine',
  // 'Company',
  // 'PermissionTemplate',
] as const;

type SoftDeleteModel = (typeof SOFT_DELETE_MODELS)[number];

function isSoftDeleteModel(model: string): model is SoftDeleteModel {
  return SOFT_DELETE_MODELS.includes(model as SoftDeleteModel);
}

// Map of model relations to their target models
// This is used to inject soft delete filters into nested includes
const RELATION_MODEL_MAP: Record<string, Record<string, string>> = {
  User: {
    branches: 'UserBranch',
  },
  Blueprint: {
    machines: 'Machine',
  },
  Company: {
    branches: 'CompanyBranch',
  },
  CompanyBranch: {
    machines: 'Machine',
    users: 'UserBranch',
    productionLines: 'ProductionLine',
  },
  ProductionLine: {
    machines: 'MachineProductionLine',
  },
  Machine: {
    services: 'MachineService',
    fields: 'MachineField',
    serviceRequests: 'ServiceRequest',
    productionLines: 'MachineProductionLine',
  },
  MachineService: {
    serviceRequest: 'ServiceRequest',
  },
  ServiceRequest: {
    services: 'MachineService',
  },
};

function getRelationModel(modelName: string, relationKey: string): string | null {
  return RELATION_MODEL_MAP[modelName]?.[relationKey] || null;
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
    machine: {
      async delete<M, A>(
        this: M,
        data: Prisma.Args<M, 'delete'>,
      ): Promise<Prisma.Result<M, A, 'update'>> {
        return softDeleteHandler(Prisma.getExtensionContext(this), data);
      },
    },
    machineService: {
      async delete<M, A>(
        this: M,
        data: Prisma.Args<M, 'delete'>,
      ): Promise<Prisma.Result<M, A, 'update'>> {
        return softDeleteHandler(Prisma.getExtensionContext(this), data);
      },
    },
    machineField: {
      async delete<M, A>(
        this: M,
        data: Prisma.Args<M, 'delete'>,
      ): Promise<Prisma.Result<M, A, 'update'>> {
        return softDeleteHandler(Prisma.getExtensionContext(this), data);
      },
    },
    serviceRequest: {
      async delete<M, A>(
        this: M,
        data: Prisma.Args<M, 'delete'>,
      ): Promise<Prisma.Result<M, A, 'update'>> {
        return softDeleteHandler(Prisma.getExtensionContext(this), data);
      },
    },
    machineProductionLine: {
      async delete<M, A>(
        this: M,
        data: Prisma.Args<M, 'delete'>,
      ): Promise<Prisma.Result<M, A, 'update'>> {
        return softDeleteHandler(Prisma.getExtensionContext(this), data);
      },
    },
    companyBranch: {
      async delete<M, A>(
        this: M,
        data: Prisma.Args<M, 'delete'>,
      ): Promise<Prisma.Result<M, A, 'update'>> {
        return softDeleteHandler(Prisma.getExtensionContext(this), data);
      },
    },
    productionLine: {
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
    machine: {
      async deleteMany<M, A>(
        this: M,
        data: Prisma.Args<M, 'deleteMany'>,
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
      },
    },
    machineService: {
      async deleteMany<M, A>(
        this: M,
        data: Prisma.Args<M, 'deleteMany'>,
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
      },
    },
    machineField: {
      async deleteMany<M, A>(
        this: M,
        data: Prisma.Args<M, 'deleteMany'>,
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
      },
    },
    serviceRequest: {
      async deleteMany<M, A>(
        this: M,
        data: Prisma.Args<M, 'deleteMany'>,
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
      },
    },
    machineProductionLine: {
      async deleteMany<M, A>(
        this: M,
        data: Prisma.Args<M, 'deleteMany'>,
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
      },
    },
    companyBranch: {
      async deleteMany<M, A>(
        this: M,
        data: Prisma.Args<M, 'deleteMany'>,
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        return softDeleteManyHandler(Prisma.getExtensionContext(this), data);
      },
    },
    productionLine: {
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
        // Helper to inject deletedAt filter into nested includes and counts
        function injectSoftDeleteFilters(obj: any, currentModel: string): void {
          if (!obj || typeof obj !== 'object') return;

          // Handle include
          if (obj.include && typeof obj.include === 'object') {
            // Handle _count within include
            if (
              obj.include._count &&
              typeof obj.include._count === 'object' &&
              obj.include._count.select
            ) {
              Object.keys(obj.include._count.select).forEach((relationKey) => {
                const relationModel = getRelationModel(currentModel, relationKey);

                if (relationModel && isSoftDeleteModel(relationModel)) {
                  const currentValue = obj.include._count.select[relationKey];

                  // If it's just `true`, convert to object with where clause
                  if (currentValue === true) {
                    obj.include._count.select[relationKey] = {
                      where: { deletedAt: null },
                    };
                  }
                  // If it's already an object, merge the where clause
                  else if (typeof currentValue === 'object') {
                    obj.include._count.select[relationKey] = {
                      ...currentValue,
                      where: {
                        ...(currentValue.where || {}),
                        deletedAt: null,
                      },
                    };
                  }
                }
              });
            }

            // Handle other includes
            Object.keys(obj.include).forEach((relationKey) => {
              // Skip _count as it's handled above
              if (relationKey === '_count') return;

              const relationValue = obj.include[relationKey];
              const relationModel = getRelationModel(currentModel, relationKey);

              if (!relationModel) return;

              // If relation points to a soft-deletable model, add where filter
              if (isSoftDeleteModel(relationModel)) {
                // Convert boolean `true` to object with where clause
                if (relationValue === true) {
                  obj.include[relationKey] = {
                    where: { deletedAt: null },
                  };
                }
                // Merge where clause if it's already an object
                else if (typeof relationValue === 'object') {
                  obj.include[relationKey] = {
                    ...relationValue,
                    where: {
                      ...(relationValue.where || {}),
                      deletedAt: null,
                    },
                  };
                }
              }

              // Recursively process nested includes
              if (typeof obj.include[relationKey] === 'object') {
                injectSoftDeleteFilters(obj.include[relationKey], relationModel);
              }
            });
          }
        }

        // Apply filter to top-level query if the model is soft-deletable
        if (isSoftDeleteModel(model)) {
          if (operation === 'findUnique' || operation === 'findFirst' || operation === 'findMany') {
            args.where = { ...args.where, deletedAt: null };
          }
        }

        // Inject filters into nested includes and counts
        injectSoftDeleteFilters(args, model);

        return query(args);
      },
    },
  },
});
