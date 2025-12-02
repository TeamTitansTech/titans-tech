import { z } from 'zod';

export const PistonsThresholdsSchema = z
  .object({
    // Difference thresholds (for side-to-side differences)
    difference_greenMin: z.number().nonnegative(),
    difference_yellowMin: z.number().positive(),
    difference_redMin: z.number().positive(),
  })
  .refine(
    (data) => {
      // Validate that yellowMin > greenMin and redMin > yellowMin
      if (
        data.difference_yellowMin <= data.difference_greenMin ||
        data.difference_redMin <= data.difference_yellowMin
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Must have greenMin < yellowMin < redMin for difference thresholds',
    },
  );

export type PistonsThresholdsDto = z.infer<typeof PistonsThresholdsSchema>;

export const CreateThresholdPistonsSchema = PistonsThresholdsSchema.merge(
  z.object({
    blueprintId: z.string(),
  }),
);

export type CreateThresholdPistonsDto = z.infer<typeof CreateThresholdPistonsSchema>;

/**
 * Schema for updating threshold pistons (partial update)
 * Makes all PistonsThresholdsSchema fields optional
 * Note: Validation happens in service layer after merge with existing values
 */
export const UpdateThresholdPistonsSchema = PistonsThresholdsSchema.partial().extend({
  recalculateAlerts: z.boolean().optional(),
});

export type UpdateThresholdPistonsDto = z.infer<typeof UpdateThresholdPistonsSchema>;
