import { z } from 'zod';

/**
 * Schema for clutch thresholds validation
 * Monitors 4 differential-based measurements:
 * 1. Gear Backlash (Before/After differential)
 * 2. Crank Endplay (Before/After differential)
 * 3. Brake Clearance (Total/Rear differential)
 * 4. Hydraulic Clutch Clearance (Total/Rear differential)
 */
export const ClutchThresholdsSchema = z
  .object({
    // Gear Backlash thresholds (Before/After differential)
    gearBacklash_greenMin: z.number().positive(),
    gearBacklash_yellowMin: z.number().positive(),
    gearBacklash_redMin: z.number().positive(),

    // Crank Endplay thresholds (Before/After differential)
    crankEndplay_greenMin: z.number().positive(),
    crankEndplay_yellowMin: z.number().positive(),
    crankEndplay_redMin: z.number().positive(),

    // Brake Clearance thresholds (Total/Rear differential)
    brakeClearance_greenMin: z.number().positive(),
    brakeClearance_yellowMin: z.number().positive(),
    brakeClearance_redMin: z.number().positive(),

    // Hydraulic Clutch Clearance thresholds (Total/Rear differential)
    hydClutchClearance_greenMin: z.number().positive(),
    hydClutchClearance_yellowMin: z.number().positive(),
    hydClutchClearance_redMin: z.number().positive(),
  })
  .refine(
    (data) => {
      // Validate that yellowMin > greenMin and redMin > yellowMin for each field
      const fields = ['gearBacklash', 'crankEndplay', 'brakeClearance', 'hydClutchClearance'];

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
export const UpdateThresholdClutchSchema = ClutchThresholdsSchema.partial();

export type UpdateThresholdClutchDto = z.infer<typeof UpdateThresholdClutchSchema>;
