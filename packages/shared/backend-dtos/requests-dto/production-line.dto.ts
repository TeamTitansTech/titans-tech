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

// Canvas shapes for Konva drawing
export const canvasShapeSchema = z.object({
  id: z.string(),
  type: z.enum(['line', 'rectangle', 'circle', 'arrow', 'text']),
  x: z.number(),
  y: z.number(),
  stroke: z.string(),
  strokeWidth: z.number(),
  // Line and arrow specific
  points: z.array(z.number()).optional(),
  // Rectangle specific
  width: z.number().optional(),
  height: z.number().optional(),
  // Circle specific
  radius: z.number().optional(),
  // Text specific
  text: z.string().optional(),
  fontSize: z.number().optional(),
  // Optional fill
  fill: z.string().optional(),
});

export type CanvasShape = z.infer<typeof canvasShapeSchema>;

export const updateCanvasShapesSchema = z.object({
  shapes: z.array(canvasShapeSchema),
});

export type UpdateCanvasShapesDto = z.infer<typeof updateCanvasShapesSchema>;
