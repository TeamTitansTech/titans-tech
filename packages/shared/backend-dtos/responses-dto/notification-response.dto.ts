import { Prisma } from '@titans-tech/db';
import { z } from 'zod';
import {
  SimpleSchemaToTestEnum,
  UrgentRequestNotificationMetadataDto,
} from './notifications/admin';

export const NotificationTypeDtoSchema = z.enum([
  'URGENT_SERVICE_REQUEST',
  'SERVICE_REMINDER',
  'SERVICE_OVERDUE',
  'SERVICE_COMPLETED',
  'INSPECTION_ALERT',
]);

export const ClientNotificationResponseDtoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  machineId: z.string().nullable(),
  machineName: z.string().nullable(),
  message: z.string(),
  isRead: z.boolean(),
  redirectUrl: z.string().nullable(),
  type: NotificationTypeDtoSchema,
  metadata: z.record(z.string(), z.any()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const adminNotificationRecipientInclude = {
  notification: true,
} satisfies Prisma.AdminNotificationRecipientInclude;

export type AdminNotificationResponse = Prisma.AdminNotificationRecipientGetPayload<{
  include: typeof adminNotificationRecipientInclude;
}>;

export type AdminNotificationResponseWithMetadata = AdminNotificationResponse & {
  notification: AdminNotificationResponse['notification'] & {
    metadata: UrgentRequestNotificationMetadataDto | SimpleSchemaToTestEnum | null;
  };
};

export type NotificationTypeDto = z.infer<typeof NotificationTypeDtoSchema>;
export type ClientNotificationResponseDto = z.infer<typeof ClientNotificationResponseDtoSchema>;
