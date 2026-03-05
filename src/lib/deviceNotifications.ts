/**
 * Device Notification Service
 * Triggers system-level notifications in the Android notification bar
 * using Capacitor Local Notifications plugin.
 */

import { Capacitor } from '@capacitor/core';

let LocalNotifications: any = null;
let permissionGranted = false;
let notifIdCounter = 1;

// Server base URL for resolving relative image paths
const SERVER_BASE = (import.meta.env.VITE_API_URL || 'https://splitx.azurewebsites.net/api').replace('/api', '');

/**
 * Initialize the local notification system.
 * Must be called once at app startup.
 */
export async function initDeviceNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[DeviceNotif] Not a native platform — skipping init');
    return;
  }

  try {
    const mod = await import('@capacitor/local-notifications');
    LocalNotifications = mod.LocalNotifications;

    // Check current permission status
    const permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display === 'granted') {
      permissionGranted = true;
    } else if (permStatus.display !== 'denied') {
      // Request permission
      const result = await LocalNotifications.requestPermissions();
      permissionGranted = result.display === 'granted';
    }

    if (permissionGranted) {
      // Create notification channel for Android (required for Android 8+)
      await LocalNotifications.createChannel({
        id: 'splitx_main',
        name: 'SplitX Notifications',
        description: 'Expense, settlement & broadcast notifications',
        importance: 4, // HIGH
        visibility: 1, // PUBLIC
        vibration: true,
        lights: true,
        lightColor: '#D4A843',
      });

      await LocalNotifications.createChannel({
        id: 'splitx_broadcast',
        name: 'SplitX Broadcasts',
        description: 'Admin broadcast announcements',
        importance: 5, // MAX
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: '#3b82f6',
      });

      console.log('[DeviceNotif] Initialized successfully');
    } else {
      console.log('[DeviceNotif] Permission denied');
    }
  } catch (err) {
    console.error('[DeviceNotif] Init failed:', err);
  }
}

interface DeviceNotifData {
  type: string;
  title: string;
  message: string;
  imageUrl?: string;
  groupName?: string;
  amount?: number;
  actorName?: string;
  senderName?: string;
  fromSelf?: boolean;
}

/**
 * Resolve image URL to an absolute URL.
 * Handles relative paths (e.g., /uploads/...) by prepending server base.
 */
function resolveImageUrl(url?: string): string | null {
  if (!url) return null;
  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Relative path — prepend server base
  return `${SERVER_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * Show a notification in the device notification bar.
 * Call this whenever an SSE event is received.
 */
export async function showDeviceNotification(data: DeviceNotifData): Promise<void> {
  if (!LocalNotifications || !permissionGranted) return;

  // Don't show device notification for own actions
  if (data.fromSelf) return;

  // Don't show for connection events
  if (data.type === 'connected') return;

  const id = notifIdCounter++;

  // Pick the right channel based on type
  const isBroadcast = data.type === 'broadcast';
  const channelId = isBroadcast ? 'splitx_broadcast' : 'splitx_main';

  // Build notification body
  let title = data.title || 'SplitX';
  let body = data.message || '';

  // Enhance body with context
  if (data.groupName && !body.includes(data.groupName)) {
    body += ` • ${data.groupName}`;
  }

  const notifOptions: any = {
    id,
    title,
    body,
    channelId,
    smallIcon: 'ic_notification',  // Custom SplitX drawable icon
    largeIcon: 'ic_launcher',       // App launcher icon as large icon
    autoCancel: true,
    group: isBroadcast ? 'broadcasts' : 'activities',
    groupSummary: false,
    extra: {
      type: data.type,
    },
  };

  // Attach image if present
  const resolvedImg = resolveImageUrl(data.imageUrl);
  if (resolvedImg) {
    notifOptions.largeBody = body;
    notifOptions.summaryText = 'SplitX';
    notifOptions.attachments = [
      {
        id: `img-${id}`,
        url: resolvedImg,
      },
    ];
  }

  try {
    await LocalNotifications.schedule({
      notifications: [notifOptions],
    });
  } catch (err) {
    console.error('[DeviceNotif] Failed to schedule notification:', err);
  }
}
