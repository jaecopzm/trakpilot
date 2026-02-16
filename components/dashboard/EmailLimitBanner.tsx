'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Zap } from 'lucide-react';
import Link from 'next/link';

export default function EmailLimitBanner() {
  const [limit, setLimit] = useState<{ remaining: number; limit: number; isPremium: boolean } | null>(null);

  useEffect(() => {
    fetchLimit();
  }, []);

  const fetchLimit = async () => {
    try {
      const res = await fetch('/api/emails/limit');
      if (res.ok) {
        const data = await res.json();
        setLimit(data);
      }
    } catch (error) {
      console.error('Failed to fetch limit:', error);
    }
  };

  if (!limit || limit.isPremium) return null;

  const percentage = (limit.remaining / limit.limit) * 100;
  const isLow = percentage < 20;

  return (
    <Card className={`${isLow ? 'border-orange-500/50 bg-orange-500/5' : ''}`}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className={`w-5 h-5 ${isLow ? 'text-orange-500' : 'text-muted-foreground'}`} />
            <div>
              <p className="text-sm font-medium">
                {limit.remaining} of {limit.limit} emails remaining this month
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${isLow ? 'bg-orange-500' : 'bg-primary'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{Math.round(percentage)}%</span>
              </div>
            </div>
          </div>
          <Link href="/pricing">
            <Button size="sm" variant={isLow ? 'default' : 'outline'}>
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
