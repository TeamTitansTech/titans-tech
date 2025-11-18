'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { AdminNotificationResponseDto } from '@titans-tech/shared/backend-dtos';

interface NotificationsSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: AdminNotificationResponseDto[];
  unreadCount: number;
  initialDataLoaded: boolean;
  loadInitialData: () => Promise<void>;
  addNotification: (notification: AdminNotificationResponseDto) => void;
  markAsRead: (notificationId: string) => void;
  clearAll: () => void;
}

const NotificationsSocketContext = createContext<NotificationsSocketContextType | undefined>(
  undefined,
);

interface NotificationsSocketProviderProps {
  children: ReactNode;
  userId?: string;
}

export function NotificationsSocketProvider({
  children,
  userId,
}: NotificationsSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationResponseDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  useEffect(() => {
    console.log('[NotificationsSocket] useEffect triggered with userId:', userId);

    if (!userId) {
      console.log('[NotificationsSocket] No userId provided, skipping WebSocket connection');
      return;
    }

    // Connect to WebSocket
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
    console.log(
      '[NotificationsSocket] Connecting to:',
      `${backendUrl}/notifications`,
      'with userId:',
      userId,
    );

    const socketInstance = io(`${backendUrl}/notifications`, {
      query: { userId },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('[NotificationsSocket] ✅ WebSocket connected successfully!');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[NotificationsSocket] ❌ WebSocket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('notification:new', (notification: AdminNotificationResponseDto) => {
      console.log('[NotificationsSocket] 🔔 New notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socketInstance.on('notification:stats', (stats: { totalUnread: number }) => {
      console.log('[NotificationsSocket] 📊 Stats update received:', stats);
      setUnreadCount(stats.totalUnread);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[NotificationsSocket] ⚠️ Connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      console.log('[NotificationsSocket] 🔌 Disconnecting WebSocket');
      socketInstance.disconnect();
    };
  }, [userId]);

  // Load initial notifications and stats when WebSocket connects
  useEffect(() => {
    const loadData = async () => {
      if (!isConnected || initialDataLoaded) return;

      console.log('[NotificationsSocket] Loading initial data...');

      try {
        // Dynamically import the API functions (they are server actions)
        const { getAdminNotifications, getAdminNotificationStats } = await import(
          '@/data/services/notifications.api'
        );

        const [notificationsResult, statsResult] = await Promise.all([
          getAdminNotifications(10, false),
          getAdminNotificationStats(),
        ]);

        if (notificationsResult.data) {
          console.log(
            '[NotificationsSocket] Loaded',
            notificationsResult.data.length,
            'notifications',
          );
          setNotifications(notificationsResult.data);
        }

        if (statsResult.data) {
          console.log('[NotificationsSocket] Loaded stats:', statsResult.data);
          setUnreadCount(statsResult.data.totalUnread);
        }

        setInitialDataLoaded(true);
      } catch (error) {
        console.error('[NotificationsSocket] Failed to load initial data:', error);
      }
    };

    loadData();
  }, [isConnected, initialDataLoaded]);

  const loadInitialData = async () => {
    console.log('[NotificationsSocket] Manual loadInitialData called');

    try {
      const { getAdminNotifications, getAdminNotificationStats } = await import(
        '@/data/services/notifications.api'
      );

      const [notificationsResult, statsResult] = await Promise.all([
        getAdminNotifications(10, false),
        getAdminNotificationStats(),
      ]);

      if (notificationsResult.data) {
        setNotifications(notificationsResult.data);
      }

      if (statsResult.data) {
        setUnreadCount(statsResult.data.totalUnread);
      }

      setInitialDataLoaded(true);
    } catch (error) {
      console.error('[NotificationsSocket] Failed to load initial data:', error);
      throw error;
    }
  };

  const addNotification = (notification: AdminNotificationResponseDto) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationsSocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        unreadCount,
        initialDataLoaded,
        loadInitialData,
        addNotification,
        markAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationsSocketContext.Provider>
  );
}

export function useNotificationsSocket() {
  const context = useContext(NotificationsSocketContext);
  if (context === undefined) {
    throw new Error('useNotificationsSocket must be used within a NotificationsSocketProvider');
  }
  return context;
}
