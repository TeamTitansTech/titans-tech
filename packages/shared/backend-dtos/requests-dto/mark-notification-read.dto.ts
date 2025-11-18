import { z } from 'zod';

export const MarkNotificationReadDtoSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required'),
});

export type MarkNotificationReadDto = z.infer<
  typeof MarkNotificationReadDtoSchema
>;
