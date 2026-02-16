'use client';

import { useEffect, useState } from 'react';
import { Mail, MousePointerClick } from 'lucide-react';

interface Notification {
  type: 'email_opened' | 'link_clicked' | 'connected';
  emailId?: string;
  recipient?: string;
  subject?: string;
  linkUrl?: string;
  timestamp?: number;
}

export function useNotifications() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connect = () => {
      eventSource = new EventSource('/api/notifications/stream');

      eventSource.onopen = () => {
        setConnected(true);
        console.log('Notifications connected');
      };

      eventSource.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          handleNotification(notification);
        } catch (error) {
          console.error('Failed to parse notification:', error);
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        eventSource?.close();
        // Reconnect after 5 seconds
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      eventSource?.close();
    };
  }, []);

  const handleNotification = (notification: Notification) => {
    if (notification.type === 'connected') {
      return;
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      if (notification.type === 'email_opened') {
        new Notification('Email Opened! 📧', {
          body: `${notification.recipient} opened "${notification.subject}"`,
          icon: '/icon.png',
          tag: notification.emailId,
        });
      } else if (notification.type === 'link_clicked') {
        new Notification('Link Clicked! 🔗', {
          body: `${notification.recipient} clicked a link`,
          icon: '/icon.png',
          tag: notification.emailId,
        });
      }
    }

    // Log to console for now (can add custom toast later)
    console.log('📧 Notification:', notification);
  };

  return { connected };
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
