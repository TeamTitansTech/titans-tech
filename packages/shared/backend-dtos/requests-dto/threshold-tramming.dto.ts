import { z } from 'zod';

export const TrammingThresholdsSchema = z
  .object({
    greenMin: z.number().positive(),
    yellowMin: z.number().positive(),
    redMin: z.number().positive(),
  })
  .refine(
    (data) => {
      // Validate that yellowMin > greenMin and redMin > yellowMin
      if (data.yellowMin <= data.greenMin || data.redMin <= data.yellowMin) {
        return false;
      }
      return true;
    },
    {
      message: 'Must have greenMin < yellowMin < redMin',
    },
  );

export type TrammingThresholdsDto = z.infer<typeof TrammingThresholdsSchema>;

export const CreateThresholdTrammingSchema = TrammingThresholdsSchema.merge(
  z.object({
    blueprintId: z.string(),
  }),
);

export type CreateThresholdTrammingDto = z.infer<typeof CreateThresholdTrammingSchema>;

export const UpdateThresholdTrammingSchema = TrammingThresholdsSchema.partial().extend({
  recalculateAlerts: z.boolean().optional(),
});

export type UpdateThresholdTrammingDto = z.infer<typeof UpdateThresholdTrammingSchema>;
