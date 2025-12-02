import { z } from 'zod';

export const PublicServiceRequestSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  requesterName: z.string().min(1, 'Requester name is required'),
  requesterEmail: z.string().email('Valid email is required'),
  requesterPhone: z.string().optional(),
  problemDescription: z.string().min(1, 'Problem description is required'),
  // Device tracking fields (populated by backend)
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceInfo: z
    .object({
      browser: z.string().optional(),
      os: z.string().optional(),
      device: z.string().optional(),
      isMobile: z.boolean().optional(),
    })
    .optional(),
});

export type PublicServiceRequestDto = z.infer<typeof PublicServiceRequestSchema>;
