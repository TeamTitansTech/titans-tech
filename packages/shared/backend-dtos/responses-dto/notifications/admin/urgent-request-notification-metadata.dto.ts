import { NotificationType } from '@titans-tech/db';
import { z } from 'zod';

export const UrgentRequestNotificationMetadataDtoSchema = z.object({
  type: z.literal(NotificationType.URGENT_SERVICE_REQUEST),
  machineId: z.string(),
  machineName: z.string(),
  requestedByUserId: z.string().nullable(),
  requestedByName: z.string().nullable(),
  notes: z.string().optional(),
  // Service request specific fields (for public QR code requests)
  serviceRequestId: z.string().optional(),
  requesterEmail: z.string().optional(),
  isPublicRequest: z.boolean().optional(),
});

export type UrgentRequestNotificationMetadataDto = z.infer<
  typeof UrgentRequestNotificationMetadataDtoSchema
>;
