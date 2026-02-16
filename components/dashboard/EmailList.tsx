'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, MousePointerClick, Trash2, TrendingUp, Mail, Inbox } from 'lucide-react';
import { LoadingTable } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/error';

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
}

interface EmailListProps {
  emails: Email[];
  loading: boolean;
  onDelete?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onFollowUp?: (email: Email) => void;
}

export default function EmailList({ emails, loading, onDelete, onViewDetails, onFollowUp }: EmailListProps) {
  const getHeatLevel = (score: number) => {
    if (score >= 50) return { label: 'Hot', color: 'text-orange-600' };
    if (score >= 20) return { label: 'Warm', color: 'text-orange-400' };
    return { label: 'Cold', color: 'text-muted-foreground' };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tracked Emails</CardTitle>
          <CardDescription>Loading your emails...</CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingTable />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tracked Emails</CardTitle>
        <CardDescription>{emails.length} emails tracked</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {emails.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No emails yet"
            description="Send your first tracked email to see engagement analytics here"
            action={{ label: 'Compose Email', onClick: () => {} }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map(email => {
                  const heat = getHeatLevel(email.heat_score);
                  return (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.recipient}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {email.subject}
                      </TableCell>
                      <TableCell>
                        {email.opened_at ? (
                          <Badge variant="secondary" className="gap-1">
                            <Eye className="w-3 h-3" />
                            {email.open_count} opens
                          </Badge>
                        ) : (
                          <Badge variant="outline">Sent</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 ${heat.color}`}>
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-medium">{heat.label}</span>
                          </div>
                          {email.click_count && email.click_count > 0 && (
                            <Badge variant="secondary" className="gap-1">
                              <MousePointerClick className="w-3 h-3" />
                              {email.click_count}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(email.opened_at || email.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onViewDetails?.(email.id)}
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onFollowUp?.(email)}
                            title="Send follow-up"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => onDelete(email.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
