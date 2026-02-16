'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Eye, MousePointerClick, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  totalSent: number;
  totalOpened: number;
  totalClicks: number;
  openRate: number;
}

export default function StatsCards({ totalSent, totalOpened, totalClicks, openRate }: StatsCardsProps) {
  const stats = [
    { label: 'Sent', value: totalSent, icon: Mail, color: 'text-blue-600' },
    { label: 'Opened', value: totalOpened, icon: Eye, color: 'text-green-600' },
    { label: 'Clicks', value: totalClicks, icon: MousePointerClick, color: 'text-orange-600' },
    { label: 'Open Rate', value: `${openRate}%`, icon: TrendingUp, color: 'text-purple-600' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
