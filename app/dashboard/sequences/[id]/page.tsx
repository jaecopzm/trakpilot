'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Users, Mail, Play, Pause, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface SequenceStep {
    id: string;
    step_order: number;
    day_delay: number;
    subject: string;
    body: string;
}

interface Sequence {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'archived';
    created_at: number;
}

export default function SequenceViewPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [sequence, setSequence] = useState<Sequence | null>(null);
    const [steps, setSteps] = useState<SequenceStep[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Sequence Details (In a real app, this would be a specific endpoint with joined data)
                // For MVP we can just fetch list and filter or better yet, make a GET /api/sequences/[id]
                // But for now let's assume valid ID and we might need to add that specific endpoint or logic.
                // To keep it simple for this turn, I'll fetch all and find (not efficient but works for MVP)
                const res = await fetch('/api/sequences');
                if (res.ok) {
                    const data = await res.json();
                    const found = data.find((s: any) => s.id === params.id);
                    if (found) setSequence(found);
                }

                // Fetch Steps (Need an endpoint for this, or include in above)
                // Creating a specific GET /api/sequences/[id] is better practice. 
                // Let's quickly scaffold it below after this file.
                const resSteps = await fetch(`/api/sequences/${params.id}`);
                if (resSteps.ok) {
                    const data = await resSteps.json();
                    setSequence(data.sequence);
                    setSteps(data.steps);
                }
            } catch (error) {
                console.error('Failed to fetch sequence', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id]);

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading sequence...</div>;
    if (!sequence) return <div className="p-8 text-center text-destructive">Sequence not found</div>;

    return (
        <div className="max-w-5xl mx-auto p-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/sequences')}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        {sequence.name}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${sequence.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}>
                            {sequence.status.toUpperCase()}
                        </span>
                    </h1>
                    <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3" /> Created {formatDistanceToNow(sequence.created_at)} ago
                    </p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Sequence
                    </Button>
                    <Button variant="destructive" size="icon">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Replied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <h2 className="text-lg font-semibold">Sequence Steps</h2>
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                    {index + 1}
                                </div>
                                {index < steps.length - 1 && <div className="w-0.5 flex-1 bg-border my-2" />}
                            </div>

                            <Card className="flex-1">
                                <CardHeader className="py-3 px-4 bg-muted/30 border-b flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        Wait {step.day_delay} day(s)
                                    </div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Step {index + 1}</div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-2">
                                    <div className="font-medium">{step.subject}</div>
                                    <div className="text-sm text-muted-foreground line-clamp-2">
                                        {step.body.replace(/<[^>]*>/g, '')}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
