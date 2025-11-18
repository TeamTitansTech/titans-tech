import { z } from 'zod';

export const CreateUrgentRequestDtoSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  notes: z.string().optional(),
});

export type CreateUrgentRequestDto = z.infer<
  typeof CreateUrgentRequestDtoSchema
>;
