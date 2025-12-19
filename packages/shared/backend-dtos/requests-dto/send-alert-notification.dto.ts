import { z } from 'zod';

export const SendAlertNotificationDtoSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  machineId: z.string().min(1, 'Machine ID is required'),
  selectedUserIds: z.array(z.string()).optional().default([]),
  extraEmails: z.array(z.string().email('Invalid email format')).optional().default([]),
  highestSeverity: z.enum(['YELLOW', 'RED']).optional(),
  sectionsCount: z.number().optional(),
});

export type SendAlertNotificationDto = z.infer<typeof SendAlertNotificationDtoSchema>;
