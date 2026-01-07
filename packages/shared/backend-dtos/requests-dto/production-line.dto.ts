import { z } from 'zod';

export const productionLineDirectionSchema = z.enum(['LEFT_TO_RIGHT', 'RIGHT_TO_LEFT']);

export type ProductionLineDirection = z.infer<typeof productionLineDirectionSchema>;

export const createProductionLineSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  branchId: z.string().min(1, 'ID da filial é obrigatório'),
  machineIds: z.array(z.string()).default([]),
  direction: productionLineDirectionSchema.default('LEFT_TO_RIGHT'),
  createdBy: z.string().optional(),
});

export type CreateProductionLineDto = z.infer<typeof createProductionLineSchema>;

export const updateProductionLineSchema = z.object({
  name: z.string().min(1).optional(),
  machineIds: z.array(z.string()).optional(),
  direction: productionLineDirectionSchema.optional(),
});

export type UpdateProductionLineDto = z.infer<typeof updateProductionLineSchema>;

// React Flow position updates
export const nodePositionSchema = z.object({
  machineId: z.string(),
  positionX: z.number(),
  positionY: z.number(),
});

export type NodePosition = z.infer<typeof nodePositionSchema>;

export const updateNodePositionsSchema = z.object({
  positions: z.array(nodePositionSchema),
});

export type UpdateNodePositionsDto = z.infer<typeof updateNodePositionsSchema>;

// React Flow edge updates
export const productionLineEdgeSchema = z.object({
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
});

export type ProductionLineEdgeDto = z.infer<typeof productionLineEdgeSchema>;

export const updateEdgesSchema = z.object({
  edges: z.array(productionLineEdgeSchema),
});

export type UpdateEdgesDto = z.infer<typeof updateEdgesSchema>;
