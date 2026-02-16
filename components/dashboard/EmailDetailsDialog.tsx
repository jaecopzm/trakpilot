'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, MousePointerClick, Clock, MapPin, Monitor, Activity } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface EmailDetailsProps {
  emailId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EmailDetailsDialog({ emailId, open, onOpenChange }: EmailDetailsProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailId && open) {
      fetchDetails();
    }
  }, [emailId, open]);

  const fetchDetails = async () => {
    if (!emailId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/emails/${emailId}`);
      if (res.ok) {
        const data = await res.json();
        setDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch email details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!details && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-muted rounded" />
            <div className="h-40 bg-muted rounded" />
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Email Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Email Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Recipient</p>
                    <p className="font-medium">{details.recipient}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subject</p>
                    <p className="font-medium">{details.subject || '(No Subject)'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sent</p>
                    <p className="text-sm">{new Date(details.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={details.opened_at ? 'default' : 'outline'}>
                      {details.opened_at ? `Opened ${details.open_count}x` : 'Sent'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opens */}
            {details.opens && details.opens.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Opens ({details.opens.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {details.opens.map((open: any, idx: number) => (
                      <div key={idx} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{new Date(open.opened_at).toLocaleString()}</span>
                          </div>
                          {open.location && open.location !== 'Unknown' && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{open.location}</span>
                            </div>
                          )}
                          {open.device_type && (
                            <div className="flex items-center gap-2">
                              <Monitor className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{open.device_type}</span>
                            </div>
                          )}
                        </div>
                        {open.is_proxy && (
                          <Badge variant="outline" className="text-xs">Proxy</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Link Clicks */}
            {details.clicks && details.clicks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4" />
                    Link Clicks ({details.clicks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {details.clicks.map((click: any, idx: number) => (
                      <div key={idx} className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <p className="text-sm font-medium truncate">{click.original_url}</p>
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(click.clicked_at).toLocaleString()}
                              </span>
                            </div>
                            {click.location && click.location !== 'Unknown' && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{click.location}</span>
                              </div>
                            )}
                          </div>
                          {click.is_proxy && (
                            <Badge variant="outline" className="text-xs">Proxy</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Engagement Score */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Engagement Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-primary">{details.heat_score}</div>
                  <div className="flex-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${Math.min(details.heat_score, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {details.heat_score >= 50 ? 'Hot lead' : details.heat_score >= 20 ? 'Warm lead' : 'Cold lead'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
