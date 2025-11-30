import { Prisma } from '@titans-tech/db';
import { z } from 'zod';
import { UrgentRequestNotificationMetadataDto } from './notifications/admin';

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
    // TODO: remove noop when we have another metadata type, this is just to make TS identify the union properly
    metadata: UrgentRequestNotificationMetadataDto | { type: 'NOOP'; value: 'noop' };
  };
};

export type NotificationTypeDto = z.infer<typeof NotificationTypeDtoSchema>;
