import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { initDeviceNotifications, showDeviceNotification } from '@/lib/deviceNotifications';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://splitx.azurewebsites.net/api';

export interface AppNotification {
  id: string;
  type:
    | 'expense_added'
    | 'settlement_made'
    | 'settlement_received'
    | 'member_joined'
    | 'broadcast'
    | 'connected';
  title: string;
  message: string;
  groupId?: string;
  groupName?: string;
  amount?: number;
  actorName?: string;
  fromName?: string;
  toName?: string;
  imageUrl?: string;
  senderName?: string;
  senderAvatar?: string;
  fromSelf?: boolean;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearAll: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Persistence helpers
const STORAGE_KEY = 'splitx_notifications';
const MAX_NOTIFICATIONS = 50;

function loadStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_NOTIFICATIONS) : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifs: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs.slice(0, MAX_NOTIFICATIONS)));
  } catch { /* storage full — ignore */ }
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    // Load persisted notifications on mount
    return user ? loadStoredNotifications() : [];
  });
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Persist notifications whenever they change
  useEffect(() => {
    if (user) saveNotifications(notifications);
  }, [notifications, user]);

  // Stable ref-based addNotification to avoid connect dependency issues
  const notificationsRef = useRef(notifications);
  notificationsRef.current = notifications;

  const addNotification = useCallback((data: Omit<AppNotification, 'id' | 'read'>) => {
    const notification: AppNotification = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      read: false,
    };
    setNotifications((prev) => {
      // Deduplicate by checking timestamp + type + message combo
      const isDupe = prev.some(
        (p) => p.type === notification.type &&
               p.message === notification.message &&
               Math.abs(new Date(p.timestamp).getTime() - new Date(notification.timestamp).getTime()) < 2000
      );
      if (isDupe) return prev;
      return [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
    });
  }, []);

  // Use ref so connect doesn't recreate when addNotification changes
  const addNotificationRef = useRef(addNotification);
  addNotificationRef.current = addNotification;

  const connect = useCallback(() => {
    if (!user) return;
    if (!mountedRef.current) return;

    const token = localStorage.getItem('splitx_token');
    if (!token) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear any pending reconnect
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const sseUrl = `${API_BASE_URL}/notifications/subscribe?token=${encodeURIComponent(token)}`;

    try {
      const es = new EventSource(sseUrl);
      eventSourceRef.current = es;

      es.onopen = () => {
        if (!mountedRef.current) return;
        setIsConnected(true);
        console.log('[Notifications] SSE connected');
      };

      es.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const data = JSON.parse(event.data);

          // Skip the initial 'connected' event
          if (data.type === 'connected') {
            setIsConnected(true);
            return;
          }

          const notifPayload = {
            type: data.type as AppNotification['type'],
            title: data.title || 'Notification',
            message: data.message || '',
            groupId: data.groupId,
            groupName: data.groupName,
            amount: data.amount,
            actorName: data.actorName,
            fromName: data.fromName,
            toName: data.toName,
            imageUrl: data.imageUrl,
            senderName: data.senderName,
            senderAvatar: data.senderAvatar,
            fromSelf: data.fromSelf,
            timestamp: data.timestamp || new Date().toISOString(),
          };

          addNotificationRef.current(notifPayload);

          // Trigger device notification bar (Android)
          showDeviceNotification({
            type: notifPayload.type,
            title: notifPayload.title,
            message: notifPayload.message,
            imageUrl: notifPayload.imageUrl,
            groupName: notifPayload.groupName,
            amount: notifPayload.amount,
            actorName: notifPayload.actorName,
            senderName: notifPayload.senderName,
            fromSelf: notifPayload.fromSelf,
          });
        } catch (err) {
          console.error('[Notifications] Failed to parse event:', err);
        }
      };

      es.onerror = () => {
        if (!mountedRef.current) return;
        setIsConnected(false);
        es.close();
        eventSourceRef.current = null;

        // Reconnect after 5 seconds
        reconnectTimerRef.current = setTimeout(() => {
          if (mountedRef.current) {
            console.log('[Notifications] Reconnecting...');
            connect();
          }
        }, 5000);
      };
    } catch (err) {
      console.error('[Notifications] Failed to create EventSource:', err);
    }
  }, [user]); // Only depends on user — no more circular deps

  // Auto-reconnect on visibility change
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && user) {
        const es = eventSourceRef.current;
        if (!es || es.readyState !== EventSource.OPEN) {
          console.log('[Notifications] App resumed — reconnecting SSE');
          connect();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [user, connect]);

  // Capacitor native lifecycle
  useEffect(() => {
    let removeListener: (() => void) | null = null;

    (async () => {
      try {
        const { App } = await import('@capacitor/app');
        const handle = await App.addListener('appStateChange', ({ isActive }) => {
          if (isActive && user) {
            const es = eventSourceRef.current;
            if (!es || es.readyState !== EventSource.OPEN) {
              console.log('[Notifications] Capacitor resumed — reconnecting SSE');
              connect();
            }
          }
        });
        removeListener = () => handle.remove();
      } catch {
        // Not running in Capacitor
      }
    })();

    return () => { removeListener?.(); };
  }, [user, connect]);

  // Keepalive health check
  useEffect(() => {
    if (!user) return;

    const keepalive = setInterval(() => {
      const es = eventSourceRef.current;
      if (!es || es.readyState === EventSource.CLOSED) {
        setIsConnected(false);
        console.log('[Notifications] Keepalive detected dead SSE — reconnecting');
        connect();
      }
    }, 30_000);

    return () => clearInterval(keepalive);
  }, [user, connect]);

  // Connect on login, disconnect on logout
  useEffect(() => {
    if (user) {
      initDeviceNotifications();
      connect();
    } else {
      // Disconnect and clear on logout
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
      setNotifications([]);
      localStorage.removeItem(STORAGE_KEY);
    }

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [user, connect]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead, markRead, clearAll, isConnected }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
