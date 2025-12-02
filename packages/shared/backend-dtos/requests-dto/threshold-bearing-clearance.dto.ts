import { z } from 'zod';
import { ThresholdsSchema } from './blueprint.dto';

/**
 * Schema for creating threshold bearing clearance with blueprintId
 * Reuses ThresholdsSchema from blueprint.dto to avoid duplication
 * Uses merge() instead of extend() because ThresholdsSchema contains refinements
 */
export const CreateThresholdBearingClearanceSchema = ThresholdsSchema.merge(
  z.object({
    blueprintId: z.string().min(1),
  }),
);

export type CreateThresholdBearingClearanceDto = z.infer<
  typeof CreateThresholdBearingClearanceSchema
>;

/**
 * Schema for updating threshold bearing clearance (partial update)
 * Makes all ThresholdsSchema fields optional, excludes blueprintId
 * Note: Validation happens in service layer after merge with existing values
 */
export const UpdateThresholdBearingClearanceSchema = ThresholdsSchema.partial().extend({
  recalculateAlerts: z.boolean().optional(),
});

export type UpdateThresholdBearingClearanceDto = z.infer<
  typeof UpdateThresholdBearingClearanceSchema
>;
