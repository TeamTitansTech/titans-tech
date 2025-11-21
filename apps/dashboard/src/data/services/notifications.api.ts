'use server';
import { responseHandler } from '@/data/helpers/responseHandler';
import type {
  CreateUrgentRequestDto,
  AdminNotificationResponseDto,
  ClientNotificationResponseDto,
  NotificationStatsResponseDto,
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

export const getAdminNotifications = async (limit?: number, includeRead?: boolean) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (includeRead !== undefined) params.append('includeRead', includeRead.toString());

  const queryString = params.toString();
  const url = `/notifications/admin${queryString ? `?${queryString}` : ''}`;

  return await responseHandler<AdminNotificationResponseDto[]>(url);
};

export const getAdminNotificationStats = async () => {
  return await responseHandler<NotificationStatsResponseDto>('/notifications/admin/stats');
};

export const getClientNotifications = async (limit?: number, includeRead?: boolean) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (includeRead !== undefined) params.append('includeRead', includeRead.toString());

  const queryString = params.toString();
  const url = `/notifications/client${queryString ? `?${queryString}` : ''}`;

  return await responseHandler<ClientNotificationResponseDto[]>(url);
};

export const markAdminNotificationAsRead = async (notificationId: string) => {
  return await responseHandler<{ success: boolean }>(
    `/notifications/admin/${notificationId}/read`,
    {
      method: 'PATCH',
    },
  );
};

export const markClientNotificationAsRead = async (notificationId: string) => {
  return await responseHandler<{ success: boolean }>(
    `/notifications/client/${notificationId}/read`,
    {
      method: 'PATCH',
    },
  );
};

export const markAllAdminNotificationsAsRead = async () => {
  return await responseHandler<{ success: boolean; count: number }>(
    '/notifications/admin/read-all',
    {
      method: 'PATCH',
    },
  );
};

export const markAllClientNotificationsAsRead = async () => {
  return await responseHandler<{ success: boolean; count: number }>(
    '/notifications/client/read-all',
    {
      method: 'PATCH',
    },
  );
};
