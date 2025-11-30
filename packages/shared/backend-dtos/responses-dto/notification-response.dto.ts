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

const adminNotificationRecipientInclude = {
  notification: true,
} satisfies Prisma.AdminNotificationRecipientInclude;

export type AdminNotificationResponse = Prisma.AdminNotificationRecipientGetPayload<{
  include: typeof adminNotificationRecipientInclude;
}>;

export type AdminNotificationResponseWithMetadata = AdminNotificationResponse & {
  notification: AdminNotificationResponse['notification'] & {
    // TODO: remove noop when we have another metadata type, this is just to make TS identify the union properly
    metadata: UrgentRequestNotificationMetadataDto | { type: 'NOOP'; value: 'noop' };
  };
};

export type NotificationTypeDto = z.infer<typeof NotificationTypeDtoSchema>;
