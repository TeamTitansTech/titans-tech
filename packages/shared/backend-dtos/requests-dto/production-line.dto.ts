import { z } from 'zod';

export const createProductionLineSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  branchId: z.string().min(1, 'ID da filial é obrigatório'),
  machineIds: z.array(z.string()).default([]),
  createdBy: z.string().optional(),
});

export type CreateProductionLineDto = z.infer<typeof createProductionLineSchema>;

export const updateProductionLineSchema = z.object({
  name: z.string().min(1).optional(),
  machineIds: z.array(z.string()).optional(),
});

export type UpdateProductionLineDto = z.infer<typeof updateProductionLineSchema>;
