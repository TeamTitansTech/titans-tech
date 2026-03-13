import { responseHandler } from '@/data/helpers/responseHandler';
import type {
  CreateUrgentRequestDto,
  SendAlertNotificationDto,
  NotificationResponseWithMetadata,
} from '@titans-tech/shared/backend-dtos';

export const createUrgentRequest = async (data: CreateUrgentRequestDto) => {
  return await responseHandler<{ success: boolean; notificationId: string }>(
    '/notifications/urgent-request',
    {
      method: 'POST',
      body: data,
    },
  );
};

export const getNotifications = async (limit?: number, includeRead?: boolean) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (includeRead !== undefined) params.append('includeRead', includeRead.toString());

  const queryString = params.toString();
  const url = `/notifications${queryString ? `?${queryString}` : ''}`;

  return await responseHandler<NotificationResponseWithMetadata[]>(url);
};

export const markNotificationAsRead = async (notificationId: string) => {
  return await responseHandler<{ success: boolean }>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
};

export const markAllNotificationsAsRead = async () => {
  return await responseHandler<{ success: boolean; count: number }>('/notifications/read-all', {
    method: 'PATCH',
  });
};

export const sendAlertNotification = async (data: SendAlertNotificationDto) => {
  return await responseHandler<{
    success: boolean;
    emailsSent: number;
    notificationsCreated: number;
  }>('/notifications/alert-notification', {
    method: 'POST',
    body: data,
  });
};
