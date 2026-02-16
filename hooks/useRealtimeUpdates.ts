import { useEffect, useCallback } from 'react';
import { useToast } from '@/components/Toaster';

interface EmailOpenEvent {
  emailId: string;
  recipient: string;
  subject: string;
  location: string;
  deviceType: string;
  timestamp: number;
}

export function useRealtimeUpdates(onUpdate: () => void) {
  const { toast } = useToast();

  const checkForUpdates = useCallback(async () => {
    try {
      const lastCheck = localStorage.getItem('lastEmailCheck');
      const now = Date.now();
      
      const response = await fetch(`/api/activity?since=${lastCheck || now - 60000}`);
      if (!response.ok) return;

      const data = await response.json();
      
      if (data.activity && data.activity.length > 0) {
        const opens = data.activity.filter((a: any) => a.type === 'open');
        
        if (opens.length > 0) {
          const latest = opens[0];
          toast(`📧 ${latest.recipient} opened "${latest.subject}"`, 'success');
          onUpdate();
        }
      }

      localStorage.setItem('lastEmailCheck', now.toString());
    } catch (error) {
      console.error('Realtime update error:', error);
    }
  }, [onUpdate, toast]);

  useEffect(() => {
    // Initial check
    checkForUpdates();

    // Poll every 10 seconds
    const interval = setInterval(checkForUpdates, 10000);

    return () => clearInterval(interval);
  }, [checkForUpdates]);

  return { checkForUpdates };
}
