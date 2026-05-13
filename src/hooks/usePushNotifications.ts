import { useEffect, useCallback } from 'react';

export const usePushNotifications = () => {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }, []);

  const sendNotification = useCallback((title: string, body: string, onClick?: () => void) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (document.hasFocus()) return; // Don't notify if user is on the page

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `examprep-${Date.now()}`,
    });

    if (onClick) {
      notification.onclick = () => {
        window.focus();
        onClick();
        notification.close();
      };
    }

    setTimeout(() => notification.close(), 5000);
  }, []);

  // Request permission on mount
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return { requestPermission, sendNotification };
};
