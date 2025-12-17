import { z } from 'zod';
import { ThresholdsSchema } from './blueprint.dto';

/**
 * Schema for creating threshold bearing clearance single hammer with blueprintId
 * Reuses ThresholdsSchema from blueprint.dto (same fields as double hammer)
 */
export const CreateThresholdBearingClearanceSingleHammerSchema = ThresholdsSchema.merge(
  z.object({
    blueprintId: z.string().min(1),
  }),
);

export type CreateThresholdBearingClearanceSingleHammerDto = z.infer<
  typeof CreateThresholdBearingClearanceSingleHammerSchema
>;

/**
 * Schema for updating threshold bearing clearance single hammer (partial update)
 * Makes all ThresholdsSchema fields optional, excludes blueprintId
 * Note: Validation happens in service layer after merge with existing values
 */
export const UpdateThresholdBearingClearanceSingleHammerSchema = ThresholdsSchema.partial().extend({
  recalculateAlerts: z.boolean().optional(),
});

export type UpdateThresholdBearingClearanceSingleHammerDto = z.infer<
  typeof UpdateThresholdBearingClearanceSingleHammerSchema
>;
