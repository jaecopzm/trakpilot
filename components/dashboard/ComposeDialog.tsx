'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Send, Sparkles, AlertTriangle, CheckCircle2, Clock, 
  FileText, Wand2, RotateCcw, Copy, Save, Paperclip, X,
  Eye, ChevronDown, ChevronUp, Bold, Italic, List, Link2,
  Underline, AlignLeft, Calendar, Loader2
} from 'lucide-react';

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSent?: () => void;
  defaultTo?: string;
  defaultSubject?: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface AiVariant {
  id: string;
  text: string;
  tone: string;
}

export default function ComposeDialog({ open, onOpenChange, onSent, defaultTo, defaultSubject }: ComposeDialogProps) {
  const [to, setTo] = useState(defaultTo || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState(defaultSubject || '');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [spamScore, setSpamScore] = useState<number | null>(null);
  const [spamWarnings, setSpamWarnings] = useState<string[]>([]);
  const [deliverabilityScore, setDeliverabilityScore] = useState<number | null>(null);
  const [deliverabilityGrade, setDeliverabilityGrade] = useState<string | null>(null);
  const [deliverabilityIssues, setDeliverabilityIssues] = useState<any[]>([]);

  // Update when defaults change
  useEffect(() => {
    if (defaultTo) setTo(defaultTo);
    if (defaultSubject) setSubject(defaultSubject);
  }, [defaultTo, defaultSubject]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [scheduleLater, setScheduleLater] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [showVariables, setShowVariables] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [aiTone, setAiTone] = useState<'professional' | 'friendly' | 'casual' | 'formal'>('professional');
  const [aiLength, setAiLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [aiVariants, setAiVariants] = useState<AiVariant[]>([]);
  const [showVariants, setShowVariants] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const draftTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Check deliverability
  useEffect(() => {
    if (!subject && !body) return;
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/deliverability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject,
            body,
            fromEmail: 'noreply@mailtrackr.zedbeatz.com',
            hasCustomDomain: false,
            hasSPF: false,
            hasDKIM: false,
            hasDMARC: false
          })
        });
        if (res.ok) {
          const data = await res.json();
          setDeliverabilityScore(data.score);
          setDeliverabilityGrade(data.grade);
          setDeliverabilityIssues(data.issues.filter((i: any) => i.severity === 'critical' || i.severity === 'warning'));
        }
      } catch (error) {
        console.error('Deliverability check failed:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [subject, body]);

  // Auto-save draft
  const saveDraft = useCallback(async () => {
    if (!to && !subject && !body) return;
    
    try {
      await fetch('/api/emails/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to, cc, bcc, subject, body, 
          attachments: attachments.map(a => ({ name: a.name, size: a.size }))
        })
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Draft save failed:', error);
    }
  }, [to, cc, bcc, subject, body, attachments]);

  // Auto-save on content change with debounce
  useEffect(() => {
    if (draftTimeoutRef.current) {
      clearTimeout(draftTimeoutRef.current);
    }
    
    draftTimeoutRef.current = setTimeout(() => {
      saveDraft();
    }, 2000);

    return () => {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current);
      }
    };
  }, [to, cc, bcc, subject, body, saveDraft]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to send
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
      // Cmd/Ctrl + S to save draft
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
      }
      // Cmd/Ctrl + Shift + P to preview
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        setShowPreview(prev => !prev);
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, to, subject, body, saveDraft]);

  useEffect(() => {
    if (open) {
      fetchTemplates();
      loadDraft();
    }
  }, [open]);

  useEffect(() => {
    if (subject || body) {
      checkSpam();
    }
  }, [subject, body]);

  const loadDraft = async () => {
    try {
      const res = await fetch('/api/emails/draft');
      if (!res.ok) return;
      const text = await res.text();
      if (!text) return;
      const data = JSON.parse(text);
      if (data) {
        setTo(data.to || '');
        setCc(data.cc || '');
        setBcc(data.bcc || '');
        setSubject(data.subject || '');
        setBody(data.body || '');
        if (data.cc) setShowCc(true);
        if (data.bcc) setShowBcc(true);
      }
    } catch (error) {
      console.error('Failed to load draft', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (Array.isArray(data)) setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates', error);
    }
  };

  const checkSpam = async () => {
    if (!subject && !body) return;
    
    try {
      const res = await fetch('/api/emails/check-spam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subject || 'No subject', body })
      });
      const data = await res.json();
      setSpamScore(data.score);
      setSpamWarnings(data.warnings || []);
    } catch (error) {
      console.error('Spam check failed:', error);
    }
  };

  const generateWithAi = async (tone?: string, length?: string) => {
    if (!aiPrompt) return;

    setAiGenerating(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          context: { subject, recipient: to },
          tone: tone || aiTone,
          length: length || aiLength
        })
      });
      const data = await res.json();
      if (data.text) {
        setBody(data.text);
        setShowAi(false);
        setAiPrompt('');
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  const generateVariants = async () => {
    if (!aiPrompt && !body) return;

    setAiGenerating(true);
    setShowVariants(true);
    
    try {
      const tones = ['professional', 'friendly', 'casual', 'formal'];
      const variants: AiVariant[] = [];

      for (const tone of tones) {
        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: aiPrompt || `Rewrite this email:\n\n${body}`,
            context: { subject, recipient: to },
            tone,
            length: aiLength
          })
        });
        const data = await res.json();
        if (data.text) {
          variants.push({
            id: tone,
            text: data.text,
            tone
          });
        }
      }

      setAiVariants(variants);
    } catch (error) {
      console.error('Variant generation failed:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  const selectVariant = (variant: AiVariant) => {
    setBody(variant.text);
    setSelectedVariant(variant.id);
    setShowVariants(false);
    setShowAi(false);
  };

  const improveWithAi = async () => {
    if (!body) return;

    setAiGenerating(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Improve this email to be more ${aiTone} and engaging:\n\n${body}`,
          context: { subject, recipient: to },
          tone: aiTone,
          length: aiLength
        })
      });
      const data = await res.json();
      if (data.text) setBody(data.text);
    } catch (error) {
      console.error('AI improvement failed:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  const fixDeliverabilityWithAi = async () => {
    if (!subject && !body) return;

    setAiGenerating(true);
    try {
      const issuesList = deliverabilityIssues.map(i => `- ${i.message}: ${i.fix}`).join('\n');
      
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Fix these deliverability issues while keeping the core message intact:

Issues to fix:
${issuesList}

Current subject: ${subject}
Current body: ${body}

Return ONLY a JSON object with "subject" and "body" fields. Keep the tone professional and the message clear.`,
          context: { recipient: to }
        })
      });
      
      const data = await res.json();
      if (data.text) {
        try {
          const fixed = JSON.parse(data.text);
          if (fixed.subject) setSubject(fixed.subject);
          if (fixed.body) setBody(fixed.body);
        } catch {
          // If not JSON, just use as body
          if (data.text) setBody(data.text);
        }
      }
    } catch (error) {
      console.error('AI fix failed:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  const suggestSubject = async () => {
    if (!body) return;

    setAiGenerating(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Based on this email body, suggest a compelling subject line (max 60 chars, no quotes):\n\n${body}`,
          context: { recipient: to }
        })
      });
      const data = await res.json();
      if (data.text) setSubject(data.text.replace(/['"]/g, '').trim());
    } catch (error) {
      console.error('Subject suggestion failed:', error);
    } finally {
      setAiGenerating(false);
    }
  };

  const loadTemplate = (template: Template) => {
    setSubject(template.subject);
    setBody(template.body);
  };

  const saveAsTemplate = async () => {
    if (!body) return;
    const name = prompt('Template name:');
    if (!name) return;

    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, body })
      });
      fetchTemplates();
    } catch (error) {
      console.error('Save template failed:', error);
    }
  };

  const insertVariable = (variable: string) => {
    setBody(prev => prev + `{{${variable}}}`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const applyFormatting = (format: string) => {
    const textarea = bodyRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end);

    if (!selectedText) return;

    let formatted = '';
    switch (format) {
      case 'bold':
        formatted = `**${selectedText}**`;
        break;
      case 'italic':
        formatted = `*${selectedText}*`;
        break;
      case 'underline':
        formatted = `__${selectedText}__`;
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) formatted = `[${selectedText}](${url})`;
        break;
    }

    if (formatted) {
      const newBody = body.substring(0, start) + formatted + body.substring(end);
      setBody(newBody);
    }
  };

  const handleSend = async () => {
    if (!to || !body) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('to', to);
      if (cc) formData.append('cc', cc);
      if (bcc) formData.append('bcc', bcc);
      formData.append('subject', subject);
      formData.append('body', body);
      formData.append('track', 'true');
      
      if (scheduleLater && scheduleDate && scheduleTime) {
        formData.append('scheduledFor', `${scheduleDate}T${scheduleTime}`);
      }

      attachments.forEach(attachment => {
        formData.append('attachments', attachment.file);
      });

      const res = await fetch('/api/emails/send', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setTo('');
        setCc('');
        setBcc('');
        setSubject('');
        setBody('');
        setAttachments([]);
        setSpamScore(null);
        setScheduleLater(false);
        setScheduleDate('');
        setScheduleTime('');
        onOpenChange(false);
        onSent?.();
      }
    } catch (error) {
      console.error('Send failed:', error);
    } finally {
      setSending(false);
    }
  };

  const getSpamBadge = () => {
    if (deliverabilityScore !== null) {
      if (deliverabilityScore >= 90) return <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="w-3 h-3" />Grade {deliverabilityGrade}</Badge>;
      if (deliverabilityScore >= 70) return <Badge variant="secondary" className="gap-1 bg-blue-500/10 text-blue-600 border-blue-500/20"><CheckCircle2 className="w-3 h-3" />Grade {deliverabilityGrade}</Badge>;
      if (deliverabilityScore >= 50) return <Badge variant="secondary" className="gap-1 bg-orange-500/10 text-orange-600 border-orange-500/20"><AlertTriangle className="w-3 h-3" />Grade {deliverabilityGrade}</Badge>;
      return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />Grade {deliverabilityGrade}</Badge>;
    }
    if (spamScore === null) return null;
    if (spamScore > 10) return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" />High Risk</Badge>;
    if (spamScore > 5) return <Badge variant="secondary" className="gap-1 bg-orange-500/10 text-orange-600 border-orange-500/20"><AlertTriangle className="w-3 h-3" />Medium</Badge>;
    return <Badge variant="secondary" className="gap-1 bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="w-3 h-3" />Low Risk</Badge>;
  };

  const renderPreview = () => {
    return (
      <div className="border rounded-lg p-4 bg-card">
        <div className="space-y-3 mb-4 pb-4 border-b border-border">
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-muted-foreground w-16">To:</span>
            <span className="text-sm text-foreground">{to || '(no recipient)'}</span>
          </div>
          {cc && (
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-muted-foreground w-16">Cc:</span>
              <span className="text-sm text-foreground">{cc}</span>
            </div>
          )}
          {bcc && (
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-muted-foreground w-16">Bcc:</span>
              <span className="text-sm text-foreground">{bcc}</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-muted-foreground w-16">Subject:</span>
            <span className="text-sm font-semibold text-foreground">{subject || '(no subject)'}</span>
          </div>
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="whitespace-pre-wrap text-foreground">{body}</div>
        </div>
        {attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm font-medium mb-2 text-foreground">Attachments ({attachments.length})</p>
            <div className="flex flex-wrap gap-2">
              {attachments.map(a => (
                <Badge key={a.id} variant="outline" className="gap-1">
                  <Paperclip className="w-3 h-3" />
                  {a.name} ({formatFileSize(a.size)})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Compose Email</DialogTitle>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {getSpamBadge()}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {showPreview ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Email Preview</h3>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
                Back to Edit
              </Button>
            </div>
            {renderPreview()}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Edit
              </Button>
              <Button onClick={handleSend} disabled={sending || !to || !body}>
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {scheduleLater ? 'Schedule' : 'Send'}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Templates */}
            {templates.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Load Template
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    {templates.map(t => (
                      <Button
                        key={t.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => loadTemplate(t)}
                      >
                        {t.name}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <div>
              <Label htmlFor="to">To</Label>
              <div className="flex gap-2">
                <Input
                  id="to"
                  type="email"
                  placeholder="recipient@example.com (comma-separated for multiple)"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-1">
                  {!showCc && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCc(true)}
                    >
                      Cc
                    </Button>
                  )}
                  {!showBcc && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBcc(true)}
                    >
                      Bcc
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {showCc && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="cc">Cc</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowCc(false);
                      setCc('');
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <Input
                  id="cc"
                  type="email"
                  placeholder="cc@example.com"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                />
              </div>
            )}

            {showBcc && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="bcc">Bcc</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowBcc(false);
                      setBcc('');
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <Input
                  id="bcc"
                  type="email"
                  placeholder="bcc@example.com"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="subject">Subject</Label>
                {body && !subject && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={suggestSubject}
                    disabled={aiGenerating}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Suggest
                  </Button>
                )}
              </div>
              <Input
                id="subject"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              {subject.length > 60 && (
                <p className="text-xs text-orange-600 mt-1">
                  Subject too long ({subject.length}/60)
                </p>
              )}
            </div>

            {/* AI Assistant */}
            {!showAi ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAi(true)}
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Write with AI
              </Button>
            ) : (
              <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
                <Label>AI Assistant</Label>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Tone</Label>
                    <Select value={aiTone} onValueChange={(v: any) => setAiTone(v)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Length</Label>
                    <Select value={aiLength} onValueChange={(v: any) => setAiLength(v)}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Input
                  placeholder="Describe what you want to write..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateWithAi()}
                />
                
                <div className="flex flex-wrap gap-1">
                  {[
                    'Write a follow-up email',
                    'Write a cold outreach',
                    'Write a thank you email',
                    'Write a meeting request',
                    'Write a product pitch'
                  ].map(prompt => (
                    <Button
                      key={prompt}
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        setAiPrompt(prompt);
                      }}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => generateWithAi()}
                    disabled={aiGenerating || !aiPrompt}
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {aiGenerating ? 'Generating...' : 'Generate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateVariants}
                    disabled={aiGenerating || !aiPrompt}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    4 Variants
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAi(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* AI Variants */}
            {showVariants && aiVariants.length > 0 && (
              <div className="border rounded-lg p-3 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <Label>Choose a variant</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVariants(false)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <RadioGroup value={selectedVariant || ''} onValueChange={setSelectedVariant}>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {aiVariants.map(variant => (
                      <div key={variant.id} className="border rounded p-2 bg-background">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value={variant.id} id={variant.id} />
                            <Label htmlFor={variant.id} className="font-medium capitalize cursor-pointer">
                              {variant.tone}
                            </Label>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => selectVariant(variant)}
                          >
                            Use this
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 ml-6">
                          {variant.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Rich Text Toolbar */}
            <div className="border-b pb-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting('bold')}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting('italic')}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting('underline')}
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFormatting('link')}
                  title="Insert Link"
                >
                  <Link2 className="w-4 h-4" />
                </Button>
                <div className="h-4 w-px bg-border mx-1" />
                <Popover open={showVariables} onOpenChange={setShowVariables}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Copy className="w-3 h-3 mr-1" />
                      Variables
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60">
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Insert personalization:</p>
                      {['firstName', 'lastName', 'company', 'email'].map(v => (
                        <Button
                          key={v}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => {
                            insertVariable(v);
                            setShowVariables(false);
                          }}
                        >
                          {`{{${v}}}`}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {body && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={improveWithAi}
                    disabled={aiGenerating}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Improve
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                ref={bodyRef}
                id="body"
                placeholder="Write your message... (⌘+Enter to send)"
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-2"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {body.length} characters
                </p>
              </div>
              
              {/* Deliverability Issues */}
              {deliverabilityIssues.length > 0 && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Deliverability Issues
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fixDeliverabilityWithAi}
                      disabled={aiGenerating}
                      className="h-7 text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {aiGenerating ? 'Fixing...' : 'Fix with AI'}
                    </Button>
                  </div>
                  {deliverabilityIssues.slice(0, 3).map((issue, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground pl-6">
                      • {issue.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Attachments */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Attach Files
              </Button>
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-2 border rounded bg-muted/30"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Paperclip className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm truncate">{attachment.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatFileSize(attachment.size)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Spam Warnings */}
            {spamWarnings.length > 0 && (
              <div className="border border-orange-500/20 bg-orange-500/5 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-orange-600">Deliverability Issues</p>
                    <ul className="text-xs text-orange-600/80 space-y-0.5">
                      {spamWarnings.map((w, i) => (
                        <li key={i}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Scheduling */}
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="schedule"
                  checked={scheduleLater}
                  onChange={(e) => setScheduleLater(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="schedule" className="cursor-pointer">
                  Schedule for later
                </Label>
              </div>
              {scheduleLater && (
                <div className="grid grid-cols-2 gap-2 ml-6">
                  <div>
                    <Label className="text-xs">Date</Label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Time</Label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={saveAsTemplate} disabled={!body}>
                  <Save className="w-4 h-4 mr-1" />
                  Save Template
                </Button>
                <Button variant="ghost" size="sm" onClick={saveDraft}>
                  <Save className="w-4 h-4 mr-1" />
                  Save Draft
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSend} disabled={sending || !to || !body}>
                  {scheduleLater ? (
                    <Clock className="w-4 h-4 mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {sending ? 'Sending...' : scheduleLater ? 'Schedule' : 'Send'}
                </Button>
              </div>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="text-xs text-muted-foreground text-center pb-2">
              ⌘+Enter to send • ⌘+S to save draft • ⌘+Shift+P to preview
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}