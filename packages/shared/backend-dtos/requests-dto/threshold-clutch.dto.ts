import { z } from 'zod';

/**
 * Schema for clutch thresholds validation
 * Monitors 5 measurement points from the Clutch & Brake dashboard:
 * 1. Hyd Clutch Clearance Total
 * 2. Hyd Clutch Clearance Rear
 * 3. F-B (Front-Back)
 * 4. F-TB (Front Top-Bottom)
 * 5. R-TB (Rear Top-Bottom)
 */
export const ClutchThresholdsSchema = z
  .object({
    // Hyd Clutch Clearance Total thresholds
    hydClutchClearanceTotal_greenMin: z.number().positive(),
    hydClutchClearanceTotal_yellowMin: z.number().positive(),
    hydClutchClearanceTotal_redMin: z.number().positive(),

    // Hyd Clutch Clearance Rear thresholds
    hydClutchClearanceRear_greenMin: z.number().positive(),
    hydClutchClearanceRear_yellowMin: z.number().positive(),
    hydClutchClearanceRear_redMin: z.number().positive(),

    // F-B (Front-Back) thresholds
    fb_greenMin: z.number().positive(),
    fb_yellowMin: z.number().positive(),
    fb_redMin: z.number().positive(),

    // F-TB (Front Top-Bottom) thresholds
    fTB_greenMin: z.number().positive(),
    fTB_yellowMin: z.number().positive(),
    fTB_redMin: z.number().positive(),

    // R-TB (Rear Top-Bottom) thresholds
    rTB_greenMin: z.number().positive(),
    rTB_yellowMin: z.number().positive(),
    rTB_redMin: z.number().positive(),
  })
  .refine(
    (data) => {
      // Validate that yellowMin > greenMin and redMin > yellowMin for each field
      const fields = ['hydClutchClearanceTotal', 'hydClutchClearanceRear', 'fb', 'fTB', 'rTB'];

      for (const field of fields) {
        const greenMin = data[`${field}_greenMin` as keyof typeof data] as number;
        const yellowMin = data[`${field}_yellowMin` as keyof typeof data] as number;
        const redMin = data[`${field}_redMin` as keyof typeof data] as number;

        if (yellowMin <= greenMin || redMin <= yellowMin) {
          return false;
        }
      }

      return true;
    },
    {
      message: 'For each field: greenMin < yellowMin < redMin',
    },
  );

export type ClutchThresholdsDto = z.infer<typeof ClutchThresholdsSchema>;

/**
 * Schema for creating threshold clutch with blueprintId
 * Uses merge() instead of extend() because ClutchThresholdsSchema contains refinements
 */
export const CreateThresholdClutchSchema = ClutchThresholdsSchema.merge(
  z.object({
    blueprintId: z.string().min(1),
  }),
);

export type CreateThresholdClutchDto = z.infer<typeof CreateThresholdClutchSchema>;

/**
 * Schema for updating threshold clutch (partial update)
 * Makes all ClutchThresholdsSchema fields optional, excludes blueprintId
 * Note: Validation happens in service layer after merge with existing values
 */
export const UpdateThresholdClutchSchema = ClutchThresholdsSchema.partial().extend({
  recalculateAlerts: z.boolean().optional(),
});

export type UpdateThresholdClutchDto = z.infer<typeof UpdateThresholdClutchSchema>;
