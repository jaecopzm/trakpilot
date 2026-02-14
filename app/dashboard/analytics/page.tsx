'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart3, TrendingUp, MousePointerClick, Eye,
    RefreshCw, Calendar, ArrowLeft, ArrowUpRight,
    Smartphone, Monitor, Tablet, HelpCircle, Activity,
    Clock, MapPin, MousePointer
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    LineChart, Line, AreaChart, Area,
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface DailyStat {
    date: string;
    opens: number;
    clicks: number;
}

interface DeviceStat {
    name: string;
    value: number;
}

interface HourlyStat {
    hour: number;
    count: number;
}

interface AnalyticsData {
    dailyStats: DailyStat[];
    deviceDistribution: DeviceStat[];
    hourlyEngagement: HourlyStat[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/analytics');
            const json = await res.json();
            if (json.dailyStats) setData(json);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    const totalOpens = data?.dailyStats.reduce((acc, curr) => acc + curr.opens, 0) || 0;
    const totalClicks = data?.dailyStats.reduce((acc, curr) => acc + curr.clicks, 0) || 0;
    const avgOpenRate = totalOpens > 0 ? ((totalClicks / totalOpens) * 100).toFixed(1) : 0;

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight">Analytics</h1>
                            <p className="text-xs text-muted-foreground">Detailed engagement and performance insights</p>
                        </div>
                    </div>
                    <Button onClick={fetchAnalytics} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </header>

            <main className="px-6 py-8 mx-auto max-w-7xl">
                {/* Highlight Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-card/50 border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Eye className="w-5 h-5 text-primary" />
                                </div>
                                <Badge variant="secondary" className="text-success bg-success/10 border-success/20">
                                    <ArrowUpRight className="w-3 h-3 mr-1" />
                                    12%
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Opens</p>
                                <div className="text-3xl font-bold">{totalOpens}</div>
                                <p className="text-[10px] text-muted-foreground italic">Last 14 days</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-success/10 rounded-lg">
                                    <MousePointerClick className="w-5 h-5 text-success" />
                                </div>
                                <Badge variant="secondary" className="text-success bg-success/10 border-success/20">
                                    <ArrowUpRight className="w-3 h-3 mr-1" />
                                    8%
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Clicks</p>
                                <div className="text-3xl font-bold">{totalClicks}</div>
                                <p className="text-[10px] text-muted-foreground italic">Last 14 days</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 border-border/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-chart-3/10 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-chart-3" />
                                </div>
                                <Badge variant="secondary" className="text-success bg-success/10 border-success/20">
                                    <ArrowUpRight className="w-3 h-3 mr-1" />
                                    5%
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                                <div className="text-3xl font-bold">{avgOpenRate}%</div>
                                <p className="text-[10px] text-muted-foreground italic">Clicks per open</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    {/* Main Trend Chart */}
                    <Card className="lg:col-span-2 bg-card/50 border-border/50">
                        <CardHeader>
                            <CardTitle className="text-base">Engagement Trend</CardTitle>
                            <CardDescription>Daily opens and link clicks for the last 14 days</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.dailyStats}>
                                    <defs>
                                        <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#71717a"
                                        fontSize={10}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#71717a"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '12px' }}
                                        itemStyle={{ fontSize: '12px' }}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                    <Area type="monotone" dataKey="opens" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOpens)" strokeWidth={2} />
                                    <Area type="monotone" dataKey="clicks" stroke="#10b981" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Device Distribution */}
                    <Card className="bg-card/50 border-border/50">
                        <CardHeader>
                            <CardTitle className="text-base">Device Distribution</CardTitle>
                            <CardDescription>Opens by device category</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px] flex flex-col items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="80%">
                                <PieChart>
                                    <Pie
                                        data={data?.deviceDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data?.deviceDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-4 mt-2">
                                {data?.deviceDistribution.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-[11px] text-muted-foreground capitalize">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Peak Engagement Hours */}
                    <Card className="lg:col-span-3 bg-card/50 border-border/50">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                Peak Engagement Hours
                            </CardTitle>
                            <CardDescription>Activity distributed by time of day (24h format)</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[250px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.hourlyEngagement}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                    <XAxis
                                        dataKey="hour"
                                        stroke="#71717a"
                                        fontSize={10}
                                        tickFormatter={(val) => `${val}:00`}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#71717a"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff0a' }}
                                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', fontSize: '12px' }}
                                        formatter={(val) => [val, 'Events']}
                                        labelFormatter={(hour) => `Time: ${hour}:00`}
                                    />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-muted/10 border-border/30 border-dashed">
                        <CardContent className="p-6 flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-full mt-1">
                                <HelpCircle className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-1">What are &quot;Clicks&quot;?</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Every time a recipient clicks a link in your tracked email, we log the event.
                                    A high click rate combined with a high open rate indicates excellent engagement
                                    and interest in your content.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/10 border-border/30 border-dashed">
                        <CardContent className="p-6 flex items-start gap-4">
                            <div className="p-3 bg-success/10 rounded-full mt-1">
                                <Activity className="w-5 h-5 text-success" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold mb-1">Optimizing your sends</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Use the **Peak Hours** chart to decide when to send your next batch.
                                    If your engagement spikes at 10:00 AM, try to schedule your most
                                    important outreach around that time.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
