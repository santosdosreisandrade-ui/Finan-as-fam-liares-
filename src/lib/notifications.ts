import { LocalNotifications, Channel } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const NOTIFICATION_CHANNEL_ID = 'fintrack_alerts';

let channelCreated = false;

export const initNotificationChannel = async (): Promise<void> => {
  if (channelCreated) return;
  if (Capacitor.isNativePlatform() || Capacitor.getPlatform() === 'android') {
    try {
      const channel: Channel = {
        id: NOTIFICATION_CHANNEL_ID,
        name: 'Alertas Financeiros',
        description: 'Notificações de contas a pagar, vencimentos de cartões e alertas do aplicativo',
        importance: 4, // High importance
        visibility: 1, // Public
        vibration: true,
        lights: true
      };
      await LocalNotifications.createChannel(channel);
      channelCreated = true;
    } catch (e) {
      console.warn('Failed to create notification channel:', e);
    }
  }
};

export const getNotificationPermission = async (): Promise<'granted' | 'denied' | 'default'> => {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display === 'granted') return 'granted';
      if (status.display === 'denied') return 'denied';
      return 'default';
    } catch (e) {
      console.warn('Failed to check permissions via LocalNotifications', e);
    }
  }
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission as 'granted' | 'denied' | 'default';
  }
  return 'denied';
};

export const requestNotificationPermission = async (): Promise<'granted' | 'denied' | 'default'> => {
  if (Capacitor.isNativePlatform()) {
    try {
      await initNotificationChannel();
      const status = await LocalNotifications.requestPermissions();
      if (status.display === 'granted') return 'granted';
      if (status.display === 'denied') return 'denied';
      return 'default';
    } catch (e) {
      console.warn('Failed to request permissions via LocalNotifications', e);
    }
  }
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission !== 'default') return Notification.permission as 'granted' | 'denied' | 'default';
    const perm = await Notification.requestPermission();
    return perm as 'granted' | 'denied' | 'default';
  }
  return 'denied';
};

export const showNotification = async (title: string, options: { body?: string; id?: number; icon?: string; badge?: string } = {}): Promise<void> => {
  try {
    if (Capacitor.isNativePlatform()) {
      await initNotificationChannel();
      const notifId = options.id ?? Math.floor(Math.random() * 2147483647);
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body: options.body || '',
            id: notifId,
            channelId: NOTIFICATION_CHANNEL_ID,
            schedule: { at: new Date(Date.now() + 100) },
            extra: null
          }
        ]
      });
      return;
    }

    // Web browser fallback
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if (registration && registration.showNotification) {
            await registration.showNotification(title, options as NotificationOptions);
            return;
          }
        } catch {
          // Fall back to window.Notification
        }
      }
      try {
        new window.Notification(title, options as NotificationOptions);
      } catch (err) {
        console.warn('Browser Notification constructor failed:', err);
      }
    }
  } catch (e) {
    console.error('Failed to show notification:', e);
  }
};
