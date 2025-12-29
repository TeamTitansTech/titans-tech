import { z } from 'zod';

/**
 * Schema for clutch cevolani thresholds validation
 * Monitors pneumatic clutch clearance total measurement
 */
export const ClutchCevolaniThresholdsSchema = z
  .object({
    // Pneumatic Clutch Clearance Total thresholds
    pneumaticClutchClearanceTotal_greenMin: z.number(),
    pneumaticClutchClearanceTotal_yellowMin: z.number(),
    pneumaticClutchClearanceTotal_redMin: z.number(),
  })
  .refine(
    (data) => {
      // Validate that yellowMin > greenMin and redMin > yellowMin
      const greenMin = data.pneumaticClutchClearanceTotal_greenMin;
      const yellowMin = data.pneumaticClutchClearanceTotal_yellowMin;
      const redMin = data.pneumaticClutchClearanceTotal_redMin;

      return yellowMin > greenMin && redMin > yellowMin;
    },
    {
      message: 'greenMin < yellowMin < redMin',
    },
  );

export type ClutchCevolaniThresholdsDto = z.infer<typeof ClutchCevolaniThresholdsSchema>;

/**
 * Schema for creating threshold clutch cevolani with blueprintId
 * Uses merge() instead of extend() because ClutchCevolaniThresholdsSchema contains refinements
 */
export const CreateThresholdClutchCevolaniSchema = ClutchCevolaniThresholdsSchema.merge(
  z.object({
    blueprintId: z.string().min(1),
  }),
);

export type CreateThresholdClutchCevolaniDto = z.infer<typeof CreateThresholdClutchCevolaniSchema>;

/**
 * Schema for updating threshold clutch cevolani (partial update)
 * Makes all ClutchCevolaniThresholdsSchema fields optional, excludes blueprintId
 * Note: Validation happens in service layer after merge with existing values
 */
export const UpdateThresholdClutchCevolaniSchema = ClutchCevolaniThresholdsSchema.partial().extend({
  recalculateAlerts: z.boolean().optional(),
});

export type UpdateThresholdClutchCevolaniDto = z.infer<typeof UpdateThresholdClutchCevolaniSchema>;
