import { z } from 'zod';

export const CreateUrgentRequestDtoSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  notes: z.string().optional(),
  // Fields for public requests (unauthenticated user via QR code)
  requesterName: z.string().optional(),
  requesterEmail: z.string().optional(),
  requesterPhone: z.string().optional(),
  problemDescription: z.string().optional(),
});

export type CreateUrgentRequestDto = z.infer<typeof CreateUrgentRequestDtoSchema>;
