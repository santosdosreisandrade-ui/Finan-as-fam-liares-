export const showNotification = async (title: string, options: NotificationOptions = {}) => {
  try {
    if (!('Notification' in window)) return;
    
    if (Notification.permission !== 'granted') return;

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, options);
        return;
      }
    }
    // Fallback if no SW
    new window.Notification(title, options);
  } catch (e) {
    console.error('Failed to show notification:', e);
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return await Notification.requestPermission();
};
