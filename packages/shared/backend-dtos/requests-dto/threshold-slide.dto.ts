import { z } from 'zod';
import { SlideThresholdsSchema } from './blueprint.dto';

export const CreateThresholdSlideSchema = SlideThresholdsSchema.merge(
  z.object({
    blueprintId: z.string(),
  }),
);

export type CreateThresholdSlideDto = z.infer<typeof CreateThresholdSlideSchema>;

export const UpdateThresholdSlideSchema = SlideThresholdsSchema.partial();

export type UpdateThresholdSlideDto = z.infer<typeof UpdateThresholdSlideSchema>;
