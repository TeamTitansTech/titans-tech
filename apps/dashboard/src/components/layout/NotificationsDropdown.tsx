'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';
import { useInternalRouter } from '@/hooks/useInternalRouter';
import {
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from '@/data/services/notifications.api';
import type { AdminNotificationResponseDto } from '@titans-tech/shared/backend-dtos';
import { Button } from '@/components/ui/button';
import { useNotificationsSocket } from '@/contexts/NotificationsSocketContext';

export function NotificationsDropdown() {
  const t = useTranslations('header');
  const router = useInternalRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    notifications,
    unreadCount,
    markAsRead: wsMarkAsRead,
    clearAll: wsClearAll,
    addNotification,
  } = useNotificationsSocket();

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const notificationsResult = await getAdminNotifications(10, false);

      if (notificationsResult.data) {
        notificationsResult.data.forEach((notification) => {
          addNotification(notification);
        });
      }
    } catch (error) {
      console.error('Failed to load initial notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      loadInitialData();
    }
  }, [isOpen]);

  const handleNotificationClick = async (notification: AdminNotificationResponseDto) => {
    try {
      await markAdminNotificationAsRead(notification.id);

      wsMarkAsRead(notification.id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }

    setIsOpen(false);
    router.push(`/admin/machines/${notification.machineId}`);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAdminNotificationsAsRead();

      wsClearAll();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-orange-100 dark:hover:bg-orange-500/20 text-muted-foreground hover:text-orange-500 transition-all duration-200">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('notifications')}</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t('notifications')}</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-6 px-2 text-xs hover:bg-orange-100 hover:text-orange-500"
            >
              {t('markAllAsRead')}
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">{t('loading')}...</div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t('noNotifications')}
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`cursor-pointer p-4 focus:bg-orange-50 dark:focus:bg-orange-500/10 ${
                  !notification.isRead ? 'bg-orange-50/50 dark:bg-orange-500/5' : ''
                }`}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">{notification.machineName}</p>
                    {!notification.isRead && (
                      <span className="flex h-2 w-2 shrink-0 rounded-full bg-orange-500 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
