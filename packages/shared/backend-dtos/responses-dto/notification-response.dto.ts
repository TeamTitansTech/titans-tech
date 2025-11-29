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

export const AdminNotificationResponseDtoSchema = z.object({
  id: z.string(),
  machineId: z.string(),
  machineName: z.string(),
  message: z.string(),
  isRead: z.boolean(),
  type: NotificationTypeDtoSchema,
  createdByUserId: z.string(),
  createdByName: z.string(),
  createdByEmail: z.string(),
  metadata: z.record(z.string(), z.any()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

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

export const NotificationStatsResponseDtoSchema = z.object({
  totalUnread: z.number(),
  urgentRequests: z.number(),
  reminders: z.number(),
  overdue: z.number(),
});

export type AdminNotificationResponse = Prisma.AdminNotificationGetPayload<{}> & {
  metatada: UrgentRequestNotificationMetadataDto | SimpleSchemaToTestEnum;
};

export type NotificationTypeDto = z.infer<typeof NotificationTypeDtoSchema>;
export type AdminNotificationResponseDto = z.infer<typeof AdminNotificationResponseDtoSchema>;
export type ClientNotificationResponseDto = z.infer<typeof ClientNotificationResponseDtoSchema>;
export type NotificationStatsResponseDto = z.infer<typeof NotificationStatsResponseDtoSchema>;
