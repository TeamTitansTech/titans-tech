import { AdminNotificationType } from '@titans-tech/db';
import { z } from 'zod';

export const UrgentRequestNotificationMetadataDtoSchema = z.object({
  type: z.literal(AdminNotificationType.URGENT_SERVICE_REQUEST),
  machineId: z.string(),
  machineName: z.string(),
  requestedByUserId: z.string(),
  requestedByName: z.string(),
  notes: z.string().optional(),
});

export type UrgentRequestNotificationMetadataDto = z.infer<
  typeof UrgentRequestNotificationMetadataDtoSchema
>;
