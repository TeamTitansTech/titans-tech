import { NotificationType } from '@titans-tech/db';
import { z } from 'zod';

export const InspectionAlertNotificationMetadataDtoSchema = z.object({
  type: z.literal(NotificationType.INSPECTION_ALERT),
  machineId: z.string(),
  machineName: z.string(),
  highestSeverity: z.enum(['RED', 'YELLOW']),
  serviceId: z.string(),
  sectionsCount: z.number(),
});

export type InspectionAlertNotificationMetadataDto = z.infer<
  typeof InspectionAlertNotificationMetadataDtoSchema
>;
