import { z } from 'zod';

export const GibsThresholdsSchema = z
  .object({
    usable_greenMin: z.number().positive(),
    usable_yellowMin: z.number().positive(),
    usable_redMin: z.number().positive(),
  })
  .refine(
    (data) => {
      // Validate that yellowMin > greenMin and redMin > yellowMin
      if (
        data.usable_yellowMin <= data.usable_greenMin ||
        data.usable_redMin <= data.usable_yellowMin
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Must have greenMin < yellowMin < redMin',
    },
  );

export type GibsThresholdsDto = z.infer<typeof GibsThresholdsSchema>;

export const CreateThresholdGibsSchema = GibsThresholdsSchema.merge(
  z.object({
    blueprintId: z.string(),
  }),
);

export type CreateThresholdGibsDto = z.infer<typeof CreateThresholdGibsSchema>;

export const UpdateThresholdGibsSchema = GibsThresholdsSchema.partial();

export type UpdateThresholdGibsDto = z.infer<typeof UpdateThresholdGibsSchema>;
