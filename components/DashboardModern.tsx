'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw, Bell } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/Toaster';
import { useNotifications, requestNotificationPermission } from '@/hooks/useNotifications';
import { ErrorDisplay } from '@/components/ui/error';
import StatsCards from './dashboard/StatsCards';
import CommandPalette from './dashboard/CommandPalette';
import EmailList from './dashboard/EmailList';
import ComposeDialog from './dashboard/ComposeDialog';
import EmailDetailsDialog from './dashboard/EmailDetailsDialog';
import EmailLimitBanner from './dashboard/EmailLimitBanner';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

interface Email {
  id: string;
  recipient: string;
  subject: string;
  created_at: number;
  opened_at: number | null;
  open_count: number;
  click_count?: number;
  heat_score: number;
  source?: string;
  status?: string;
}

export default function DashboardModern() {
  const { user } = useUser();
  const { toast } = useToast();
  const { connected } = useNotifications();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [detailsEmailId, setDetailsEmailId] = useState<string | null>(null);
  const [followUpEmail, setFollowUpEmail] = useState<Email | null>(null);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/emails');
      if (!res.ok) throw new Error('Failed to fetch emails');
      const data = await res.json();
      if (Array.isArray(data)) {
        setEmails(data);
      }
    } catch (error) {
      console.error('Failed to fetch', error);
      setError(error instanceof Error ? error.message : 'Failed to load emails');
      toast('Failed to load emails', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this email?')) return;
    try {
      const res = await fetch(`/api/emails/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Email deleted', 'success');
        fetchEmails();
      }
    } catch (error) {
      toast('Failed to delete', 'error');
    }
  };

  const handleFollowUp = (email: Email) => {
    setFollowUpEmail(email);
    setComposeOpen(true);
  };

  // Real-time updates
  useRealtimeUpdates(fetchEmails);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setComposeOpen(true);
        }
      }
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          fetchEmails();
          toast('Refreshing emails...', 'info');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fetchEmails, toast]);

  // Calculate stats
  const totalSent = emails.length;
  const totalOpened = emails.filter(e => e.opened_at).length;
  const totalClicks = emails.reduce((sum, e) => sum + (e.click_count || 0), 0);
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onCompose={() => setComposeOpen(true)}
        onRefresh={fetchEmails}
      />

      <ComposeDialog
        open={composeOpen}
        onOpenChange={setComposeOpen}
        onSent={() => {
          fetchEmails();
          toast('Email sent successfully!', 'success');
        }}
      />

      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.firstName || 'User'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {connected && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Live
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEmails}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setComposeOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Compose
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6 space-y-6">
        {error && (
          <ErrorDisplay 
            error={error} 
            title="Failed to load dashboard"
            onRetry={fetchEmails}
          />
        )}

        <EmailLimitBanner />

        <StatsCards
          totalSent={totalSent}
          totalOpened={totalOpened}
          totalClicks={totalClicks}
          openRate={openRate}
        />

        <EmailList 
          emails={emails} 
          loading={loading} 
          onDelete={handleDelete}
          onViewDetails={(id) => setDetailsEmailId(id)}
          onFollowUp={handleFollowUp}
        />

        <div className="text-center py-4 text-sm text-muted-foreground">
          <p>Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Cmd+K</kbd> to open command palette</p>
          <p className="mt-1">Press <kbd className="px-2 py-1 bg-muted rounded text-xs">R</kbd> to refresh • <kbd className="px-2 py-1 bg-muted rounded text-xs">N</kbd> to compose</p>
        </div>
      </div>

      <ComposeDialog 
        open={composeOpen} 
        onOpenChange={(open) => {
          setComposeOpen(open);
          if (!open) setFollowUpEmail(null);
        }}
        onSent={fetchEmails}
        defaultTo={followUpEmail?.recipient}
        defaultSubject={followUpEmail?.subject ? `Re: ${followUpEmail.subject}` : undefined}
      />

      <EmailDetailsDialog
        emailId={detailsEmailId}
        open={!!detailsEmailId}
        onOpenChange={(open) => !open && setDetailsEmailId(null)}
      />
    </div>
  );
}
