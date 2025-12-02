import { NotificationType } from '@titans-tech/db';
import { z } from 'zod';

export const ServiceReminderOrOverdueNotificationMetadataDtoSchema = z.object({
  type: z.enum([NotificationType.SERVICE_REMINDER, NotificationType.SERVICE_OVERDUE]),
  machineId: z.string(),
  machineName: z.string(),
  lastServiceDate: z.string().nullable(),
  daysOverdue: z.number(),
  companySlug: z.string(),
});

export type ServiceReminderOrOverdueNotificationMetadataDto = z.infer<
  typeof ServiceReminderOrOverdueNotificationMetadataDtoSchema
>;
