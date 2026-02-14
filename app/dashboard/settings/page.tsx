'use client';

import React, { useState, useEffect } from 'react';
import {
    Bell, Key, Copy, Check, RefreshCw, Shield, Globe, Trash2,
    AlertTriangle, ExternalLink, CreditCard, User, Mail, Eye, EyeOff,
    Server, ChevronDown, ChevronUp, Send, Sparkles
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useToast } from '@/components/Toaster';

export default function SettingsPage() {
    const { user } = useUser();
    const { toast } = useToast();

    // Email Identity
    const [displayName, setDisplayName] = useState('');
    const [replyToEmail, setReplyToEmail] = useState('');

    // Slack webhook
    const [slackWebhook, setSlackWebhook] = useState('');

    // Custom SMTP
    const [showSmtp, setShowSmtp] = useState(false);
    const [smtpHost, setSmtpHost] = useState('');
    const [smtpPort, setSmtpPort] = useState('');
    const [smtpUser, setSmtpUser] = useState('');
    const [smtpPass, setSmtpPass] = useState('');
    const [fromEmail, setFromEmail] = useState('');
    const [hasCustomSmtp, setHasCustomSmtp] = useState(false);
    const [customDomain, setCustomDomain] = useState('');
    const [isPremium, setIsPremium] = useState(false);
    const [testingSmtp, setTestingSmtp] = useState(false);
    // API Key
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [apiKeyCreatedAt, setApiKeyCreatedAt] = useState<number | null>(null);
    const [generatingKey, setGeneratingKey] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Save states
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const SMTP_PRESETS = {
        gmail: { host: 'smtp.gmail.com', port: '465', label: 'Gmail', help: 'https://support.google.com/mail/answer/185833' },
        outlook: { host: 'smtp.office365.com', port: '587', label: 'Outlook / Office 365', help: 'https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-for-outlook-com-d088b986-291d-42b8-9564-9c414e2aa040' },
        yahoo: { host: 'smtp.mail.yahoo.com', port: '465', label: 'Yahoo', help: 'https://help.yahoo.com/kb/SLN15241.html' }
    };

    const applyPreset = (key: keyof typeof SMTP_PRESETS) => {
        const preset = SMTP_PRESETS[key];
        setSmtpHost(preset.host);
        setSmtpPort(preset.port);
        toast(`Applied ${preset.label} settings. Remember to use an "App Password"!`, 'info');
    };
    useEffect(() => {
        Promise.all([
            fetch('/api/settings').then(r => r.json()),
            fetch('/api/auth/apikey').then(r => r.json()),
        ]).then(([settings, keyData]) => {
            if (settings.display_name) setDisplayName(settings.display_name);
            else if (user?.firstName) setDisplayName(`${user.firstName} ${user.lastName || ''}`.trim());

            if (settings.reply_to_email) setReplyToEmail(settings.reply_to_email);
            else if (user?.primaryEmailAddress?.emailAddress) setReplyToEmail(user.primaryEmailAddress.emailAddress);

            if (settings.slack_webhook_url) setSlackWebhook(settings.slack_webhook_url);
            if (settings.smtp_host) { setSmtpHost(settings.smtp_host); setShowSmtp(true); }
            if (settings.smtp_port) setSmtpPort(String(settings.smtp_port));
            if (settings.smtp_user) setSmtpUser(settings.smtp_user);
            if (settings.smtp_pass) setSmtpPass(settings.smtp_pass);
            if (settings.from_email) setFromEmail(settings.from_email);
            if (settings.has_custom_smtp) setHasCustomSmtp(true);
            if (settings.custom_domain) setCustomDomain(settings.custom_domain);
            if (settings.is_premium) setIsPremium(true);

            if (keyData.key) setApiKey(keyData.key);
            if (keyData.created_at) setApiKeyCreatedAt(keyData.created_at);
        }).catch(console.error).finally(() => setLoading(false));
    }, [user]);

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    display_name: displayName,
                    reply_to_email: replyToEmail,
                    slack_webhook_url: slackWebhook,
                    smtp_host: smtpHost || null,
                    smtp_port: smtpPort || null,
                    smtp_user: smtpUser || null,
                    smtp_pass: smtpPass || null,
                    from_email: fromEmail || null,
                    custom_domain: customDomain || null,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast('Settings saved successfully', 'success');
                if (smtpHost) setHasCustomSmtp(true);
                else setHasCustomSmtp(false);
            } else {
                toast(data.error || 'Failed to save settings', 'error');
            }
        } catch (error) {
            console.error(error);
            toast('Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleTestSmtp = async () => {
        setTestingSmtp(true);
        try {
            const res = await fetch('/api/settings/test-smtp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    host: smtpHost,
                    port: smtpPort,
                    user: smtpUser,
                    pass: smtpPass,
                    fromEmail: fromEmail,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast('SMTP Test Successful! Received test email.', 'success');
            } else {
                toast(data.error || 'SMTP Test Failed', 'error');
            }
        } catch (error) {
            toast('Failed to run SMTP test', 'error');
        } finally {
            setTestingSmtp(false);
        }
    };

    const handleGenerateKey = async () => {
        setGeneratingKey(true);
        try {
            const res = await fetch('/api/auth/apikey', { method: 'POST' });
            const data = await res.json();
            if (data.key) {
                setApiKey(data.key);
                setApiKeyCreatedAt(data.created_at);
                toast('API key generated', 'success');
            }
        } catch (error) {
            console.error(error);
            toast('Failed to generate key', 'error');
        } finally {
            setGeneratingKey(false);
        }
    };

    const copyToClipboard = async (text: string, field: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast('Copied to clipboard', 'info');
        setTimeout(() => setCopiedField(null), 2000);
    };

    const senderPreview = `"${displayName || 'Your Name'} via MailTrackr"`;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
                        <p className="text-xs text-muted-foreground">
                            Manage your email identity, notifications, and integrations
                        </p>
                    </div>
                    <Button onClick={handleSaveAll} disabled={saving} size="sm">
                        {saving ? (
                            <>
                                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check className="w-3.5 h-3.5 mr-1.5" />
                                Save All
                            </>
                        )}
                    </Button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="space-y-8">

                    {/* ─── Profile Section ─── */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-4 h-4 text-primary" />
                            <h2 className="text-base font-semibold">Profile</h2>
                        </div>
                        <Card className="bg-card/50 border-border/50">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                                        {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user?.primaryEmailAddress?.emailAddress}
                                        </p>
                                        <Badge variant={isPremium ? "default" : "secondary"} className="mt-2 text-[10px]">
                                            {isPremium ? 'Pro Plan' : 'Free Plan'}
                                        </Badge>
                                    </div>
                                    <Link href="/pricing">
                                        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                                            <CreditCard className="w-3.5 h-3.5" />
                                            Upgrade
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <Separator className="bg-border/30" />

                    {/* ─── Email Identity Section ─── */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Send className="w-4 h-4 text-primary" />
                            <h2 className="text-base font-semibold">Email Identity</h2>
                        </div>
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Sender Information</CardTitle>
                                <CardDescription className="text-xs">
                                    Configure how your emails appear to recipients
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="display-name" className="text-xs">Display Name</Label>
                                    <Input
                                        id="display-name"
                                        value={displayName}
                                        onChange={e => setDisplayName(e.target.value)}
                                        placeholder="John Doe"
                                        className="text-sm"
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Recipients will see this name in their inbox
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reply-to" className="text-xs">Reply-To Email</Label>
                                    <Input
                                        id="reply-to"
                                        type="email"
                                        value={replyToEmail}
                                        onChange={e => setReplyToEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="text-sm"
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        When recipients reply, their response goes to this address
                                    </p>
                                </div>

                                {/* Preview */}
                                <div className="rounded-lg border border-border/30 bg-muted/10 p-4">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-medium">Preview</p>
                                    <div className="space-y-1">
                                        <p className="text-sm">
                                            <span className="text-muted-foreground">From:</span>{' '}
                                            <span className="font-medium">{senderPreview}</span>
                                        </p>
                                        <p className="text-sm">
                                            <span className="text-muted-foreground">Reply-To:</span>{' '}
                                            <span className="font-mono text-xs">{replyToEmail || 'Not set'}</span>
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <Separator className="bg-border/30" />

                    {/* ─── Custom SMTP Section ─── */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Server className="w-4 h-4 text-primary" />
                            <h2 className="text-base font-semibold">Custom SMTP</h2>
                            <Badge variant="secondary" className="text-[10px]">Optional</Badge>
                        </div>
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader className="pb-3">
                                <button
                                    className="flex items-center justify-between w-full text-left"
                                    onClick={() => setShowSmtp(!showSmtp)}
                                >
                                    <div>
                                        <CardTitle className="text-sm">SMTP Configuration</CardTitle>
                                        <CardDescription className="text-xs">
                                            {hasCustomSmtp
                                                ? 'Custom SMTP configured — emails sent via your server'
                                                : 'Use your own SMTP server instead of Resend'}
                                        </CardDescription>
                                    </div>
                                    {showSmtp
                                        ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                        : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                </button>
                            </CardHeader>
                            {showSmtp && (
                                <CardContent className="space-y-4 border-t border-border/30 pt-4">
                                    <div className="space-y-3 mb-2">
                                        <Label className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Quick Presets</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(SMTP_PRESETS).map(([key, preset]) => (
                                                <Button
                                                    key={key}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-7 text-[10px] px-2.5 bg-primary/5 hover:bg-primary/10 border border-primary/10"
                                                    onClick={() => applyPreset(key as keyof typeof SMTP_PRESETS)}
                                                >
                                                    <Sparkles className="w-3 h-3 mr-1.5 text-primary" />
                                                    {preset.label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="smtp-host" className="text-xs">SMTP Host</Label>
                                            <Input
                                                id="smtp-host"
                                                value={smtpHost}
                                                onChange={e => setSmtpHost(e.target.value)}
                                                placeholder="smtp.gmail.com"
                                                className="text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="smtp-port" className="text-xs">Port</Label>
                                            <Input
                                                id="smtp-port"
                                                value={smtpPort}
                                                onChange={e => setSmtpPort(e.target.value)}
                                                placeholder="587"
                                                className="text-xs font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="smtp-user" className="text-xs">Username</Label>
                                            <Input
                                                id="smtp-user"
                                                value={smtpUser}
                                                onChange={e => setSmtpUser(e.target.value)}
                                                placeholder="you@example.com"
                                                className="text-xs font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="smtp-pass" className="text-xs">Password</Label>
                                            <Input
                                                id="smtp-pass"
                                                type="password"
                                                value={smtpPass}
                                                onChange={e => setSmtpPass(e.target.value)}
                                                placeholder="••••••••"
                                                className="text-xs font-mono"
                                            />
                                            <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 bg-amber-50/50 p-1.5 rounded border border-amber-100/50">
                                                <Shield className="w-3 h-3" />
                                                <span>Pro tip: Use an <b>App Password</b> for security.</span>
                                                <a
                                                    href="https://support.google.com/accounts/answer/185833"
                                                    target="_blank"
                                                    className="underline hover:text-amber-700 ml-auto"
                                                >
                                                    Learn more
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="from-email" className="text-xs">From Email</Label>
                                        <Input
                                            id="from-email"
                                            value={fromEmail}
                                            onChange={e => setFromEmail(e.target.value)}
                                            placeholder="noreply@yourdomain.com"
                                            className="text-xs font-mono"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={handleTestSmtp}
                                            disabled={testingSmtp || !smtpHost || !smtpUser}
                                        >
                                            {testingSmtp ? (
                                                <>
                                                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                                    Testing...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-3.5 h-3.5 mr-1.5" />
                                                    Test Connection
                                                </>
                                            )}
                                        </Button>

                                        {hasCustomSmtp && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                                                onClick={() => {
                                                    setSmtpHost(''); setSmtpPort(''); setSmtpUser('');
                                                    setSmtpPass(''); setFromEmail('');
                                                    setHasCustomSmtp(false);
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3 mr-1.5" />
                                                Remove Custom SMTP
                                            </Button>
                                        )}
                                    </div>

                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        When custom SMTP is configured, your emails are sent directly through your server
                                        instead of Resend. This gives you full control over deliverability and sender identity.
                                    </p>
                                </CardContent>
                            )}
                        </Card>
                    </section>

                    <Separator className="bg-border/30" />

                    {/* ─── Notifications Section ─── */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Bell className="w-4 h-4 text-primary" />
                            <h2 className="text-base font-semibold">Notifications</h2>
                        </div>
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">Slack Integration</CardTitle>
                                <CardDescription className="text-xs">
                                    Get notified in Slack when someone opens your tracked email
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="slack" className="text-xs">Webhook URL</Label>
                                    <Input
                                        id="slack"
                                        value={slackWebhook}
                                        onChange={e => setSlackWebhook(e.target.value)}
                                        placeholder="https://hooks.slack.com/services/..."
                                        className="font-mono text-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Create an{' '}
                                        <a
                                            href="https://api.slack.com/messaging/webhooks"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline inline-flex items-center gap-0.5"
                                        >
                                            Incoming Webhook
                                            <ExternalLink className="w-2.5 h-2.5" />
                                        </a>{' '}
                                        in your Slack workspace to receive real-time open notifications.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <Separator className="bg-border/30" />

                    {/* ─── API & Integrations Section ─── */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Key className="w-4 h-4 text-primary" />
                            <h2 className="text-base font-semibold">API & Integrations</h2>
                        </div>
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm">API Key</CardTitle>
                                <CardDescription className="text-xs">
                                    Use this key to authenticate the Chrome Extension or integrate with the MailTrackr API
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {apiKey ? (
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <code className="flex-1 text-xs font-mono bg-muted/30 border border-border/50 rounded-md px-3 py-2 flex items-center break-all">
                                                {apiKey}
                                            </code>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-9 w-9 shrink-0"
                                                onClick={() => copyToClipboard(apiKey, 'apikey')}
                                            >
                                                {copiedField === 'apikey' ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                                            </Button>
                                        </div>
                                        {apiKeyCreatedAt && (
                                            <p className="text-[10px] text-muted-foreground">
                                                Generated on {new Date(apiKeyCreatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 p-4 text-center">
                                        <Key className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground">No API key generated yet</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handleGenerateKey}
                                        disabled={generatingKey}
                                        variant={apiKey ? 'outline' : 'default'}
                                        size="sm"
                                    >
                                        {generatingKey ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            apiKey ? 'Regenerate Key' : 'Generate API Key'
                                        )}
                                    </Button>
                                </div>

                                {apiKey && (
                                    <div className="rounded-lg border border-border/30 bg-muted/10 p-3 space-y-2">
                                        <p className="text-xs font-medium flex items-center gap-1.5">
                                            <Shield className="w-3 h-3 text-primary" />
                                            How to use your API key
                                        </p>
                                        <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
                                            <li>Install the MailTrackr Chrome Extension</li>
                                            <li>Open the extension popup and go to Settings</li>
                                            <li>Paste your API key in the authentication field</li>
                                            <li>You&apos;re connected! Track emails directly from Gmail</li>
                                        </ol>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tracking Domain */}
                        <Card className="bg-card/50 border-border/50 mt-4">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-sm">Custom Tracking Domain</CardTitle>
                                        <CardDescription className="text-xs">
                                            Use your own domain for tracking pixels to improve deliverability
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px]">Pro</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className={`space-y-3 ${!isPremium ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <div className="space-y-2">
                                        <Label htmlFor="custom-domain" className="text-xs">Domain</Label>
                                        <Input
                                            id="custom-domain"
                                            value={customDomain}
                                            onChange={e => setCustomDomain(e.target.value)}
                                            placeholder="track.yourdomain.com"
                                            className="text-xs"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-[10px] text-muted-foreground">
                                            Add a CNAME record pointing to <code className="bg-muted px-1 rounded">track.mailtrackr.io</code>
                                        </span>
                                    </div>
                                    {!isPremium && (
                                        <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 p-2 rounded">
                                            Custom domains require a Pro subscription. Upgrade to enable this feature.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <Separator className="bg-border/30" />

                    {/* ─── Danger Zone ─── */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <h2 className="text-base font-semibold text-destructive">Danger Zone</h2>
                        </div>
                        <Card className="bg-card/50 border-destructive/20">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Delete All Tracking Data</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Permanently remove all tracked emails, open events, and analytics data.
                                            This action cannot be undone.
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs">
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                        Delete Data
                                    </Button>
                                </div>

                                <Separator className="bg-border/30" />

                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Delete Account</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Permanently delete your MailTrackr account and all associated data.
                                            This cannot be reversed.
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs">
                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                        Delete Account
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <div className="h-8" />
                </div>
            </main>
        </div>
    );
}
