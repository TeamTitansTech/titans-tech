import { Prisma } from '@titans-tech/db';
import { z } from 'zod';
import {
  InspectionAlertNotificationMetadataDto,
  ServiceReminderOrOverdueNotificationMetadataDto,
  UrgentRequestNotificationMetadataDto,
} from './notifications/admin';

export const NotificationTypeDtoSchema = z.enum([
  'URGENT_SERVICE_REQUEST',
  'SERVICE_REMINDER',
  'SERVICE_OVERDUE',
  'SERVICE_COMPLETED',
  'INSPECTION_ALERT',
]);

const notificationRecipientInclude = {
  notification: true,
} satisfies Prisma.NotificationRecipientInclude;

export type NotificationResponse = Prisma.NotificationRecipientGetPayload<{
  include: typeof notificationRecipientInclude;
}>;

export type NotificationResponseWithMetadata = NotificationResponse & {
  notification: NotificationResponse['notification'] & {
    metadata:
      | UrgentRequestNotificationMetadataDto
      | InspectionAlertNotificationMetadataDto
      | ServiceReminderOrOverdueNotificationMetadataDto;
  };
};

export type NotificationTypeDto = z.infer<typeof NotificationTypeDtoSchema>;
