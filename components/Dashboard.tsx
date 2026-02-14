'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Plus, Copy, RefreshCw, ExternalLink, Trash2, Mail, Eye, TrendingUp, BarChart3, Check, Image, Code,
    MonitorSmartphone, Settings, MapPin, Monitor, Clock, List, Send, Sparkles, Link as LinkIcon,
    Bold, Italic, MousePointerClick, Save, MousePointer, Activity, ChevronRight, X, LineChart
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/Toaster';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Email {
    id: string;
    recipient: string;
    subject: string;
    created_at: number;
    opened_at: number | null;
    open_count: number;
    click_count?: number;
    heat_score: number;
    best_time?: number | null;
    source?: string;
    status?: string;
}
interface OpenEvent {
    id: string;
    ip_address: string;
    location: string;
    device_type: string;
    user_agent: string;
    opened_at: number;
    is_proxy: number;
}

interface ActivityItem {
    type: 'open' | 'click';
    id: string;
    location: string;
    device_type: string | null;
    timestamp: number;
    recipient: string;
    subject: string;
    url: string | null;
    is_proxy: number;
}

interface Template {
    id: string;
    name: string;
    subject: string;
    body: string;
}

export default function Dashboard() {
    const { user } = useUser();
    const { toast } = useToast();
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // New Email Form State
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [generatedPixelHtml, setGeneratedPixelHtml] = useState('');
    const [trackingUrl, setTrackingUrl] = useState('');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [activeMethod, setActiveMethod] = useState<'gmail' | 'outlook' | 'html' | 'link'>('gmail');

    // Delete
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Compose Email State
    const [showCompose, setShowCompose] = useState(false);
    const [quickLinkUrl, setQuickLinkUrl] = useState('');
    const [generatingLink, setGeneratingLink] = useState(false);
    const [quickTrackedLink, setQuickTrackedLink] = useState<string | null>(null);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkInputUrl, setLinkInputUrl] = useState('');
    const [linkInputText, setLinkInputText] = useState('');
    const [composeTo, setComposeTo] = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeBody, setComposeBody] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const [trackEmail, setTrackEmail] = useState(true);

    // Templates & Activity
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loadingActivity, setLoadingActivity] = useState(true);
    const [savingTemplate, setSavingTemplate] = useState(false);

    // Scheduling
    const [sendLater, setSendLater] = useState(false);
    const [scheduledAt, setScheduledAt] = useState('');

    const insertTag = (tag: string) => {
        const textarea = document.getElementById('compose-body') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        let newText = '';
        if (tag === 'b') newText = `${before}<b>${selection}</b>${after}`;
        if (tag === 'i') newText = `${before}<i>${selection}</i>${after}`;
        if (tag === 'br') newText = `${before}<br/>${after}`;

        setComposeBody(newText);
        setTimeout(() => {
            textarea.focus();
            // Move cursor to end of inserted tag
            // simplistic for now
        }, 0);
    };



    // History
    const [viewingEmailId, setViewingEmailId] = useState<string | null>(null);
    const [openHistory, setOpenHistory] = useState<OpenEvent[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/templates');
            const data = await res.json();
            if (Array.isArray(data)) setTemplates(data);
        } catch (error) { console.error('Failed to fetch templates', error); }
    };

    const fetchActivity = async (showLoading = false) => {
        if (showLoading) setLoadingActivity(true);
        try {
            const res = await fetch('/api/activity');
            const data = await res.json();
            if (Array.isArray(data)) setActivity(data);
        } catch (error) { console.error('Failed to fetch activity', error); }
        finally { if (showLoading) setLoadingActivity(false); }
    };

    const fetchEmails = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/emails');
            const data = await res.json();
            if (Array.isArray(data)) {
                setEmails(data);
            }
        } catch (error) {
            console.error('Failed to fetch', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmails();
        fetchTemplates();
        fetchActivity(true);
        const interval = setInterval(() => {
            fetchEmails();
            fetchActivity();
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchEmails]);



    // Fetch history when viewing an email
    useEffect(() => {
        if (viewingEmailId) {
            setLoadingHistory(true);
            fetch(`/api/emails/${viewingEmailId}/opens`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setOpenHistory(data);
                })
                .catch(console.error)
                .finally(() => setLoadingHistory(false));
        } else {
            setOpenHistory([]);
        }
    }, [viewingEmailId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch('/api/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient, subject }),
            });
            const data = await res.json();
            if (data.tracking_url) {
                setTrackingUrl(data.tracking_url);
                setGeneratedPixelHtml(`<img src="${data.tracking_url}" alt="" width="1" height="1" style="display:none;" />`);
                fetchEmails();
                setRecipient('');
                setSubject('');
                toast('Tracker created successfully', 'success');
            }
        } catch (error) {
            console.error(error);
            toast('Failed to create tracker', 'error');
        } finally {
            setCreating(false);
        }
    };

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast('Copied to clipboard', 'info');
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await fetch(`/api/emails/${id}`, { method: 'DELETE' });
            setEmails(prev => prev.filter(e => e.id !== id));
            toast('Tracker deleted', 'success');
        } catch (error) {
            console.error('Failed to delete', error);
            toast('Failed to delete tracker', 'error');
        } finally {
            setDeletingId(null);
        }
    };



    const handleSaveAsTemplate = async () => {
        if (!composeBody) return;
        const name = prompt('Enter a name for this template:');
        if (!name) return;

        setSavingTemplate(true);
        try {
            const res = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, subject: composeSubject, body: composeBody }),
            });
            if (res.ok) {
                toast('Template saved!', 'success');
                fetchTemplates();
            }
        } catch (error) {
            toast('Failed to save template', 'error');
        } finally {
            setSavingTemplate(false);
        }
    };

    const applyTemplate = (id: string) => {
        const template = templates.find(t => t.id === id);
        if (template) {
            setComposeSubject(template.subject);
            setComposeBody(template.body);
            setSelectedTemplateId(id);
        }
    };

    const handleSendEmail = async () => {
        if (!composeTo || !composeBody) return;

        setSendingEmail(true);
        try {
            const res = await fetch('/api/emails/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: composeTo,
                    subject: composeSubject,
                    body: composeBody,
                    track: trackEmail,
                    scheduled_at: sendLater && scheduledAt ? new Date(scheduledAt).getTime() : null
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setShowCompose(false);
                setComposeTo('');
                setComposeSubject('');
                setComposeBody('');
                toast('Email sent successfully!', 'success');
                if (trackEmail) fetchEmails();
            } else {
                toast(data.error || 'Failed to send email', 'error');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            toast('Failed to send email', 'error');
        } finally {
            setSendingEmail(false);
        }
    };

    const handleCreateQuickLink = async () => {
        if (!quickLinkUrl) return;
        setGeneratingLink(true);
        try {
            const res = await fetch('/api/l/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: quickLinkUrl }),
            });
            const data = await res.json();
            if (res.ok) {
                setQuickTrackedLink(data.trackedUrl);
                toast('Tracking link created!', 'success');
                fetchEmails();
                fetchActivity();
            } else {
                toast(data.error || 'Failed to create link', 'error');
            }
        } catch (error) {
            toast('Error creating link', 'error');
        } finally {
            setGeneratingLink(false);
        }
    };

    const insertLinkAtCursor = () => {
        if (!linkInputUrl) return;
        const linkHtml = `<a href="${linkInputUrl}">${linkInputText || linkInputUrl}</a>`;
        setComposeBody(prev => prev + linkHtml);
        setShowLinkInput(false);
        setLinkInputUrl('');
        setLinkInputText('');
    };

    const handleResend = async (id: string) => {
        try {
            const res = await fetch(`/api/emails/${id}/resend`, { method: 'POST' });
            if (res.ok) {
                toast('Follow-up email queued!', 'success');
                fetchEmails();
            } else {
                toast('Failed to queue follow-up', 'error');
            }
        } catch (error) {
            toast('Failed to queue follow-up', 'error');
        }
    };

    const getHeatLevel = (score: number) => {
        if (score >= 50) return { label: 'Blazing', color: 'text-orange-600', fill: 'fill-orange-600', icon: Sparkles };
        if (score >= 20) return { label: 'Hot', color: 'text-orange-500', fill: 'fill-orange-500', icon: TrendingUp };
        if (score >= 5) return { label: 'Warm', color: 'text-orange-400', fill: 'fill-orange-400', icon: Activity };
        return { label: 'Cold', color: 'text-muted-foreground', fill: 'none', icon: Clock };
    };

    const formatBestTime = (hour: number | undefined | null) => {
        if (hour === undefined || hour === null) return 'Not yet known';
        const period = hour >= 12 ? 'PM' : 'AM';
        const h = hour % 12 || 12;
        return `${h}:00 ${period}`;
    };

    // Stats
    const totalSent = emails.length;
    const totalOpened = emails.filter(e => e.opened_at).length;
    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    const totalOpenEvents = emails.reduce((acc, e) => acc + (e.open_count || 0), 0);

    const stats = [
        { label: 'Total Sent', value: totalSent, icon: Mail, color: 'text-primary' },
        { label: 'Opened', value: totalOpened, icon: Eye, color: 'text-success' },
        { label: 'Open Rate', value: `${openRate}%`, icon: TrendingUp, color: 'text-chart-3' },
        { label: 'Total Opens', value: totalOpenEvents, icon: BarChart3, color: 'text-chart-2' },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Compact Header */}
            <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
                        <p className="text-xs text-muted-foreground">
                            Welcome back, {user?.firstName || 'there'}
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button onClick={() => setCreating(true)} size="sm" className="gap-2 px-2 sm:px-3">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New Tracker</span>
                        </Button>
                        <Button onClick={() => setShowCompose(true)} size="sm" variant="secondary" className="gap-2 px-2 sm:px-3">
                            <Send className="w-4 h-4" />
                            <span className="hidden sm:inline">Compose</span>
                        </Button>
                        <Link href="/dashboard/settings">
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden sm:flex gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={fetchEmails}
                            className="h-9 w-9"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, i) => (
                        <Card key={i} className="bg-card/50 border-border/50">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        {stat.label}
                                    </span>
                                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                </div>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Create Tracker */}
                    <div className="lg:col-span-1">
                        <Card className="bg-card/50 border-border/50 sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-primary" />
                                    Create Tracker
                                </CardTitle>
                                <CardDescription>
                                    Generate an invisible tracking pixel for your email
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="recipient">Recipient Email</Label>
                                        <Input
                                            id="recipient"
                                            type="email"
                                            required
                                            value={recipient}
                                            onChange={e => setRecipient(e.target.value)}
                                            placeholder="client@company.com"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject Reference</Label>
                                        <Input
                                            id="subject"
                                            type="text"
                                            value={subject}
                                            onChange={e => setSubject(e.target.value)}
                                            placeholder="Q4 Proposal"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={creating}
                                        className="w-full"
                                    >
                                        {creating ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            'Generate Tracking Pixel'
                                        )}
                                    </Button>
                                </form>

                                {generatedPixelHtml && (
                                    <div className="mt-6 space-y-4">
                                        <div className="flex items-center gap-2 text-success">
                                            <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className="text-sm font-medium">Tracking Pixel Ready!</span>
                                        </div>

                                        {/* Method Tabs */}
                                        <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
                                            {[
                                                { id: 'gmail' as const, label: 'Gmail', icon: Image },
                                                { id: 'outlook' as const, label: 'Outlook', icon: Monitor },
                                                { id: 'html' as const, label: 'HTML', icon: Code },
                                                { id: 'link' as const, label: 'Tracking Link', icon: LinkIcon },
                                            ].map(method => (
                                                <button
                                                    key={method.id}
                                                    onClick={() => setActiveMethod(method.id)}
                                                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${activeMethod === method.id
                                                        ? 'bg-background text-foreground shadow-sm'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                        }`}
                                                >
                                                    <method.icon className="w-3 h-3" />
                                                    {method.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Gmail Method */}
                                        {activeMethod === 'gmail' && (
                                            <div className="space-y-3">
                                                <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                                                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Image URL to insert</p>
                                                    <div className="flex gap-2">
                                                        <code className="flex-1 text-xs font-mono break-all text-foreground/80 bg-muted/30 rounded px-2 py-1.5 border border-border/30">
                                                            {trackingUrl}
                                                        </code>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 shrink-0"
                                                            onClick={() => copyToClipboard(trackingUrl, 'url')}
                                                        >
                                                            {copiedField === 'url' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xs font-medium text-muted-foreground">Steps:</p>
                                                    <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                                                        <li>Copy the URL above</li>
                                                        <li>In Gmail compose, click the <strong className="text-foreground">Insert Image</strong> icon (📷) in the toolbar</li>
                                                        <li>Select <strong className="text-foreground">&quot;Web Address (URL)&quot;</strong> tab</li>
                                                        <li>Paste the URL and click Insert</li>
                                                        <li>The pixel will be invisible — send your email!</li>
                                                    </ol>
                                                </div>
                                            </div>
                                        )}

                                        {/* Outlook Method */}
                                        {activeMethod === 'outlook' && (
                                            <div className="space-y-3">
                                                <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                                                    <p className="text-xs font-medium text-muted-foreground mb-1.5">Image URL to insert</p>
                                                    <div className="flex gap-2">
                                                        <code className="flex-1 text-xs font-mono break-all text-foreground/80 bg-muted/30 rounded px-2 py-1.5 border border-border/30">
                                                            {trackingUrl}
                                                        </code>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8 shrink-0"
                                                            onClick={() => copyToClipboard(trackingUrl, 'url-outlook')}
                                                        >
                                                            {copiedField === 'url-outlook' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xs font-medium text-muted-foreground">Steps:</p>
                                                    <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                                                        <li>Copy the URL above</li>
                                                        <li>In Outlook compose, go to <strong className="text-foreground">Insert → Pictures → Online Pictures</strong></li>
                                                        <li>Paste the URL in the search/URL field</li>
                                                        <li>Insert the image — it will be invisible</li>
                                                        <li>Send your email as normal</li>
                                                    </ol>
                                                </div>
                                            </div>
                                        )}

                                        {/* HTML Method */}
                                        {activeMethod === 'html' && (
                                            <div className="space-y-3">
                                                <div className="rounded-lg border border-border/50 bg-background/80 p-3">
                                                    <p className="text-xs font-medium text-muted-foreground mb-1.5">HTML snippet</p>
                                                    <code className="block text-xs font-mono break-all text-foreground/80 bg-muted/30 rounded px-2 py-2 border border-border/30">
                                                        {generatedPixelHtml}
                                                    </code>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full mt-2"
                                                        onClick={() => copyToClipboard(generatedPixelHtml, 'html')}
                                                    >
                                                        {copiedField === 'html' ? (
                                                            <><Check className="w-3 h-3 mr-2 text-success" /> Copied!</>
                                                        ) : (
                                                            <><Copy className="w-3 h-3 mr-2" /> Copy HTML Snippet</>
                                                        )}
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-xs font-medium text-muted-foreground">Steps:</p>
                                                    <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                                                        <li>Copy the code above</li>
                                                        <li>Paste it into your custom HTML email template</li>
                                                        <li>It will log opens automatically</li>
                                                    </ol>
                                                </div>
                                            </div>
                                        )}

                                        {/* Link Method */}
                                        {activeMethod === 'link' && (
                                            <div className="space-y-3">
                                                <div className="space-y-2">
                                                    <Label htmlFor="quick-url" className="text-xs">Destination URL</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="quick-url"
                                                            placeholder="https://yourpage.com/offer"
                                                            className="h-9 text-xs"
                                                            value={quickLinkUrl}
                                                            onChange={(e) => setQuickLinkUrl(e.target.value)}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            className="h-9"
                                                            onClick={handleCreateQuickLink}
                                                            disabled={generatingLink || !quickLinkUrl}
                                                        >
                                                            {generatingLink ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Generate'}
                                                        </Button>
                                                    </div>
                                                </div>

                                                {quickTrackedLink && (
                                                    <div className="rounded-lg border border-border/50 bg-background/80 p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <p className="text-xs font-medium text-muted-foreground mb-1.5">Your Tracked Link</p>
                                                        <div className="flex gap-2">
                                                            <code className="flex-1 text-xs font-mono break-all text-foreground/80 bg-muted/30 rounded px-2 py-1.5 border border-border/30">
                                                                {quickTrackedLink}
                                                            </code>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 shrink-0"
                                                                onClick={() => copyToClipboard(quickTrackedLink!, 'quick-link')}
                                                            >
                                                                {copiedField === 'quick-link' ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                                                            </Button>
                                                        </div>
                                                        <p className="text-[10px] text-muted-foreground mt-2">
                                                            Paste this link on LinkedIn, WhatsApp, or anywhere else.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <Separator className="bg-border/30" />
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            💡 <strong>Tip:</strong> The Gmail method is the easiest. The pixel is a 1x1 transparent image — completely invisible to your recipient.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activity Card */}
                        <Card className="bg-card/50 border-border/50 mt-6">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-primary" />
                                        Live Activity
                                    </CardTitle>
                                    <CardDescription>Real-time engagement feed</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => fetchActivity()} className="h-8 w-8">
                                    <RefreshCw className={`w-3.5 h-3.5 ${loadingActivity ? 'animate-spin' : ''}`} />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[400px] overflow-y-auto px-1 pb-2">
                                    {loadingActivity && activity.length === 0 ? (
                                        <div className="py-12 text-center text-xs text-muted-foreground">Loading activity...</div>
                                    ) : activity.length === 0 ? (
                                        <div className="py-12 text-center text-xs text-muted-foreground">No recent activity</div>
                                    ) : (
                                        <div className="divide-y divide-border/30">
                                            {activity.map((item) => (
                                                <div key={item.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-1 p-1.5 rounded-full ${item.type === 'open' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                                                            {item.type === 'open' ? <Eye className="w-3 h-3" /> : <MousePointerClick className="w-3 h-3" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <p className="text-[13px] font-medium truncate">{item.recipient}</p>
                                                                {item.is_proxy === 1 && (
                                                                    <Badge variant="outline" className="text-[9px] py-0 px-1 bg-amber-500/10 text-amber-500 border-amber-500/20">Proxy</Badge>
                                                                )}
                                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-auto">
                                                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-muted-foreground truncate italic mb-1">&quot;{item.subject}&quot;</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground/80">
                                                                    <MapPin className="w-2.5 h-2.5" />
                                                                    {item.location}
                                                                </span>
                                                                {item.type === 'click' && item.url && (
                                                                    <span className="flex items-center gap-1 text-[10px] text-primary/80 truncate max-w-[120px]" title={item.url}>
                                                                        <MousePointer className="w-2.5 h-2.5" />
                                                                        {new URL(item.url).hostname}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Email Table */}
                    <div className="lg:col-span-2">
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Tracked Emails</CardTitle>
                                    <CardDescription>
                                        {totalSent} email{totalSent !== 1 ? 's' : ''} tracked
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent border-border/50">
                                                <TableHead className="text-xs">Recipient</TableHead>
                                                <TableHead className="text-xs">Subject</TableHead>
                                                <TableHead className="w-[120px]">Engagement</TableHead>
                                                <TableHead className="w-[100px]">Status</TableHead>
                                                <TableHead className="w-[100px]">Insights</TableHead>
                                                <TableHead className="w-[80px]">Source</TableHead>
                                                <TableHead className="text-xs text-right">Time</TableHead>
                                                <TableHead className="text-xs w-[120px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {emails.map(email => (
                                                <TableRow key={email.id} className="border-border/50">
                                                    <TableCell className="font-medium text-sm">
                                                        {email.recipient}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">
                                                        {email.subject}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            {email.opened_at ? (
                                                                <Badge variant="secondary" className="text-success border-success/20 bg-success/10 text-[10px] gap-1 px-1.5 h-5">
                                                                    <Eye className="w-3 h-3" />
                                                                    {email.open_count} Open{email.open_count !== 1 ? 's' : ''}
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className="text-[10px] px-1.5 h-5">
                                                                    Sent
                                                                </Badge>
                                                            )}
                                                            {email.click_count && email.click_count > 0 ? (
                                                                <Badge variant="secondary" className="text-primary border-primary/20 bg-primary/10 text-[10px] gap-1 px-1.5 h-5">
                                                                    <MousePointerClick className="w-3 h-3" />
                                                                    {email.click_count} Click{email.click_count !== 1 ? 's' : ''}
                                                                </Badge>
                                                            ) : null}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5">
                                                            {(() => {
                                                                const heat = getHeatLevel(email.heat_score);
                                                                return (
                                                                    <div className={`flex items-center gap-1 ${heat.color}`} title={`Engagement Score: ${email.heat_score}`}>
                                                                        <TrendingUp className={`w-3.5 h-3.5 ${heat.fill}`} />
                                                                        <span className="text-[10px] font-bold uppercase tracking-tighter">{heat.label}</span>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-[9px] text-muted-foreground uppercase font-medium">Best Time</span>
                                                            <span className="text-[10px] font-medium text-foreground">{formatBestTime(email.best_time)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {/* @ts-ignore - source might not be in type yet */}
                                                        {email.source === 'app' ? (
                                                            <div title="Sent via App" className="p-1.5 bg-primary/10 rounded-md w-fit">
                                                                <Mail className="w-3.5 h-3.5 text-primary" />
                                                            </div>
                                                        ) : email.source === 'standalone' ? (
                                                            <div title="Standalone Link" className="p-1.5 bg-amber-500/10 rounded-md w-fit">
                                                                <LinkIcon className="w-3.5 h-3.5 text-amber-500" />
                                                            </div>
                                                        ) : (
                                                            <div title="Created Manually" className="p-1.5 bg-muted rounded-md w-fit">
                                                                <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="text-xs text-muted-foreground font-mono">
                                                            {new Date(email.opened_at || email.created_at).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground/60">
                                                            {new Date(email.opened_at || email.created_at).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                                                onClick={() => setViewingEmailId(email.id)}
                                                                title="View Opens"
                                                            >
                                                                <List className="w-3.5 h-3.5" />
                                                            </Button>

                                                            {!email.opened_at && email.status === 'sent' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-muted-foreground hover:text-success"
                                                                    onClick={() => handleResend(email.id)}
                                                                    title="Smart Follow-up"
                                                                >
                                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                                </Button>
                                                            )}

                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Delete Tracker</DialogTitle>
                                                                        <DialogDescription>
                                                                            Are you sure you want to delete the tracker for{' '}
                                                                            <strong>{email.recipient}</strong>? This action cannot be undone.
                                                                        </DialogDescription>
                                                                    </DialogHeader>
                                                                    <DialogFooter>
                                                                        <Button
                                                                            variant="destructive"
                                                                            onClick={() => handleDelete(email.id)}
                                                                            disabled={deletingId === email.id}
                                                                        >
                                                                            {deletingId === email.id ? 'Deleting...' : 'Delete'}
                                                                        </Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}

                                            {emails.length === 0 && !loading && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-48 text-center">
                                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                                                                <Mail className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-foreground text-sm">No tracked emails yet</p>
                                                                <p className="text-xs mt-0.5">Create your first tracker to get started</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            {loading && emails.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-48 text-center">
                                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                                            <p className="text-sm">Loading emails...</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>



                {/* History Dialog */}
                <Dialog open={!!viewingEmailId} onOpenChange={(open) => !open && setViewingEmailId(null)}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Open History</DialogTitle>
                            <DialogDescription>
                                Detailed activity log for this email
                            </DialogDescription>
                        </DialogHeader>

                        <div className="max-h-[300px] overflow-y-auto">
                            {loadingHistory ? (
                                <div className="py-8 flex justify-center">
                                    <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : openHistory.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    No open events recorded yet.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {openHistory.map(event => {
                                        // Simple UA parser logic for display
                                        const isMobile = event.device_type === 'mobile';

                                        return (
                                            <div key={event.id} className="p-3 rounded-lg border border-border/50 bg-muted/20 flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 rounded-full bg-primary/10 text-primary mt-0.5">
                                                        {isMobile ? <MonitorSmartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-medium">
                                                                {isMobile ? 'Mobile Device' : 'Desktop Device'}
                                                            </span>
                                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal text-muted-foreground">
                                                                {event.device_type}
                                                            </Badge>
                                                            {event.is_proxy === 1 && (
                                                                <Badge variant="outline" className="text-[9px] py-0 px-1 bg-amber-500/10 text-amber-500 border-amber-500/20">Proxy</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {event.ip_address}
                                                        </p>
                                                        <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground/80 break-all">
                                                            {event.user_agent.substring(0, 50)}...
                                                        </code>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(event.opened_at).toLocaleString()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
                {/* Compose Dialog */}
                <Dialog open={showCompose} onOpenChange={setShowCompose}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Compose Email</DialogTitle>
                            <DialogDescription>
                                Send a tracked email directly from here.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="flex items-end gap-3">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="template-select">Apply Template</Label>
                                    <select
                                        id="template-select"
                                        className="w-full bg-background border border-input h-10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                        value={selectedTemplateId}
                                        onChange={(e) => applyTemplate(e.target.value)}
                                    >
                                        <option value="">Select a template...</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 gap-1.5"
                                    onClick={handleSaveAsTemplate}
                                    disabled={!composeBody || savingTemplate}
                                >
                                    <Save className="w-3.5 h-3.5" />
                                    Save as...
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="compose-to">To</Label>
                                <Input
                                    id="compose-to"
                                    placeholder="recipient@example.com"
                                    value={composeTo}
                                    onChange={(e) => setComposeTo(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="compose-subject">Subject</Label>
                                <Input
                                    id="compose-subject"
                                    placeholder="Thinking about upgrading?"
                                    value={composeSubject}
                                    onChange={(e) => setComposeSubject(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="compose-body">Message</Label>
                                <div className="border border-input rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                                    <div className="bg-muted/50 border-b border-border/50 px-2 py-1 flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => insertTag('b')} title="Bold">
                                            <Bold className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => insertTag('i')} title="Italic">
                                            <Italic className="w-3.5 h-3.5" />
                                        </Button>
                                        <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
                                            <PopoverTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" title="Insert Link">
                                                    <LinkIcon className="w-3.5 h-3.5" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 p-4" align="start">
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-sm">Insert Link</h4>
                                                    <div className="space-y-1">
                                                        <Label htmlFor="link-url" className="text-[10px] uppercase text-muted-foreground">URL</Label>
                                                        <Input
                                                            id="link-url"
                                                            placeholder="https://example.com"
                                                            value={linkInputUrl}
                                                            onChange={(e) => setLinkInputUrl(e.target.value)}
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label htmlFor="link-text" className="text-[10px] uppercase text-muted-foreground">Display Text (Optional)</Label>
                                                        <Input
                                                            id="link-text"
                                                            placeholder="Click here"
                                                            value={linkInputText}
                                                            onChange={(e) => setLinkInputText(e.target.value)}
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                    <Button size="sm" className="w-full h-8" onClick={insertLinkAtCursor}>
                                                        Add Link
                                                    </Button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        <div className="w-px h-4 bg-border mx-1 self-center" />
                                        <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => insertTag('br')}>
                                            Break Line
                                        </Button>
                                    </div>
                                    <textarea
                                        id="compose-body"
                                        className="flex min-h-[150px] w-full bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-y border-none"
                                        placeholder="Type your message here..."
                                        value={composeBody}
                                        onChange={(e) => setComposeBody(e.target.value)}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Use toolbar to format. Tracking pixel added automatically.
                                </p>
                            </div>
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-[13px]">Track Email</Label>
                                        <p className="text-[11px] text-muted-foreground">Log opens and link clicks</p>
                                    </div>
                                    <button
                                        role="switch"
                                        aria-checked={trackEmail}
                                        onClick={() => setTrackEmail(!trackEmail)}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${trackEmail ? 'bg-primary' : 'bg-muted'}`}
                                    >
                                        <span className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${trackEmail ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-[13px]">Send Later</Label>
                                        <p className="text-[11px] text-muted-foreground">Queue email for a specific time</p>
                                    </div>
                                    <button
                                        role="switch"
                                        aria-checked={sendLater}
                                        onClick={() => setSendLater(!sendLater)}
                                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${sendLater ? 'bg-primary' : 'bg-muted'}`}
                                    >
                                        <span className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${sendLater ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {sendLater && (
                                    <div className="pl-4 border-l-2 border-primary/20 space-y-2 animate-in slide-in-from-left-2 duration-200">
                                        <Label htmlFor="schedule-time" className="text-xs">Schedule Time</Label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <input
                                                    id="schedule-time"
                                                    type="datetime-local"
                                                    className="w-full bg-background border border-input rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring [color-scheme:dark]"
                                                    value={scheduledAt}
                                                    onChange={(e) => setScheduledAt(e.target.value)}
                                                    min={new Date().toISOString().slice(0, 16)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
                            <Button
                                onClick={handleSendEmail}
                                disabled={sendingEmail || !composeTo || !composeBody || (sendLater && !scheduledAt)}
                                className="min-w-[100px] gap-2"
                            >
                                {sendingEmail ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        {sendLater ? 'Schedule' : 'Send Email'}
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
