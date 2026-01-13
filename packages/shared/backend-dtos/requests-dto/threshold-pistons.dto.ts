import { z } from 'zod';

// Threshold mode enum
export const ThresholdModeEnum = z.enum(['LINEAR', 'CENTRAL']);
export type ThresholdMode = z.infer<typeof ThresholdModeEnum>;

// Linear mode schema (traditional thresholds)
const LinearModeSchema = z.object({
  thresholdMode: z.literal('LINEAR'),
  // Difference thresholds (for side-to-side differences)
  difference_greenMin: z.number().nonnegative(),
  difference_yellowMin: z.number().nonnegative(),
  difference_redMin: z.number().nonnegative(),
  // Central mode fields should be null/undefined in linear mode
  central_yellowMin: z.number().nonnegative().optional().nullable(),
  central_greenMin: z.number().nonnegative().optional().nullable(),
  central_greenMax: z.number().nonnegative().optional().nullable(),
  central_yellowMax: z.number().nonnegative().optional().nullable(),
});

// Central mode schema (U-shaped thresholds with explicit boundaries)
const CentralModeSchema = z.object({
  thresholdMode: z.literal('CENTRAL'),
  // Linear mode fields can be present but are ignored
  difference_greenMin: z.number().nonnegative().optional(),
  difference_yellowMin: z.number().nonnegative().optional(),
  difference_redMin: z.number().nonnegative().optional(),
  // Central mode: explicit boundaries
  // Red low: 0 to yellowMin
  // Yellow low: yellowMin to greenMin
  // Green: greenMin to greenMax
  // Yellow high: greenMax to yellowMax
  // Red high: above yellowMax
  central_yellowMin: z.number().nonnegative(),
  central_greenMin: z.number().nonnegative(),
  central_greenMax: z.number().nonnegative(),
  central_yellowMax: z.number().nonnegative(),
});

// Combined schema using discriminated union
export const PistonsThresholdsSchema = z
  .discriminatedUnion('thresholdMode', [LinearModeSchema, CentralModeSchema])
  .refine(
    (data) => {
      if (data.thresholdMode === 'LINEAR') {
        // Validate that yellowMin > greenMin and redMin > yellowMin
        if (
          data.difference_yellowMin <= data.difference_greenMin ||
          data.difference_redMin <= data.difference_yellowMin
        ) {
          return false;
        }
      } else if (data.thresholdMode === 'CENTRAL') {
        // Validate that boundaries are in correct order
        // yellowMin < greenMin < greenMax < yellowMax
        if (
          data.central_yellowMin >= data.central_greenMin ||
          data.central_greenMin >= data.central_greenMax ||
          data.central_greenMax >= data.central_yellowMax
        ) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        'For LINEAR mode: greenMin < yellowMin < redMin. For CENTRAL mode: yellowMin < greenMin < greenMax < yellowMax.',
    },
  );

export type PistonsThresholdsDto = z.infer<typeof PistonsThresholdsSchema>;

export const CreateThresholdPistonsSchema = PistonsThresholdsSchema.and(
  z.object({
    blueprintId: z.string(),
  }),
);

export type CreateThresholdPistonsDto = z.infer<typeof CreateThresholdPistonsSchema>;

/**
 * Schema for updating threshold pistons (partial update)
 * Note: Validation happens in service layer after merge with existing values
 */
export const UpdateThresholdPistonsSchema = z
  .object({
    thresholdMode: ThresholdModeEnum.optional(),
    difference_greenMin: z.number().nonnegative().optional(),
    difference_yellowMin: z.number().nonnegative().optional(),
    difference_redMin: z.number().nonnegative().optional(),
    central_yellowMin: z.number().nonnegative().optional().nullable(),
    central_greenMin: z.number().nonnegative().optional().nullable(),
    central_greenMax: z.number().nonnegative().optional().nullable(),
    central_yellowMax: z.number().nonnegative().optional().nullable(),
    recalculateAlerts: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If switching to CENTRAL mode, ensure required fields are present
      if (data.thresholdMode === 'CENTRAL') {
        if (
          data.central_yellowMin === undefined ||
          data.central_yellowMin === null ||
          data.central_greenMin === undefined ||
          data.central_greenMin === null ||
          data.central_greenMax === undefined ||
          data.central_greenMax === null ||
          data.central_yellowMax === undefined ||
          data.central_yellowMax === null
        ) {
          return false;
        }
        // Validate order
        if (
          data.central_yellowMin >= data.central_greenMin ||
          data.central_greenMin >= data.central_greenMax ||
          data.central_greenMax >= data.central_yellowMax
        ) {
          return false;
        }
      }
      // For LINEAR mode or partial updates, validation happens in service
      return true;
    },
    {
      message: 'CENTRAL mode requires yellowMin < greenMin < greenMax < yellowMax',
    },
  );

export type UpdateThresholdPistonsDto = z.infer<typeof UpdateThresholdPistonsSchema>;
