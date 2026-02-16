'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreVertical, Play, Pause, Trash2, Clock, Users, Mail, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

interface Sequence {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'archived';
    steps_count?: number;
    active_enrollments?: number;
    created_at: number;
}

export default function SequencesPage() {
    const [sequences, setSequences] = useState<Sequence[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchSequences();
    }, []);

    const fetchSequences = async () => {
        try {
            const res = await fetch('/api/sequences');
            if (res.ok) {
                const data = await res.json();
                setSequences(data);
            }
        } catch (error) {
            console.error('Failed to fetch sequences', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSequences = sequences.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sequences</h1>
                    <p className="text-muted-foreground mt-1">Automate your follow-ups and nurture campaigns.</p>
                </div>
                <Link href="/dashboard/sequences/new">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Sequence
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sequences..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : filteredSequences.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg bg-muted/30">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <ListChecks className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No sequences yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                        Create your first automated email sequence to engage your audience on autopilot.
                    </p>
                    <Link href="/dashboard/sequences/new">
                        <Button>Create Sequence</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredSequences.map((seq) => (
                        <div key={seq.id} className="group flex items-center justify-between p-4 border rounded-lg bg-card hover:border-primary/20 hover:shadow-sm transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${seq.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    <ListChecks className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium group-hover:text-primary transition-colors">{seq.name}</h3>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                        <span className={`flex items-center gap-1 ${seq.status === 'active' ? 'text-emerald-500' : 'text-muted-foreground'
                                            }`}>
                                            {seq.status === 'active' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                                            {seq.status.charAt(0).toUpperCase() + seq.status.slice(1)}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Created {formatDistanceToNow(seq.created_at)} ago
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 md:gap-12 mr-4 text-sm text-muted-foreground">
                                <div className="text-center min-w-[60px]">
                                    <div className="font-semibold text-foreground flex items-center justify-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" />
                                        {seq.steps_count || 0}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wider mt-0.5">Steps</div>
                                </div>
                                <div className="text-center min-w-[60px]">
                                    <div className="font-semibold text-foreground flex items-center justify-center gap-1.5">
                                        <Users className="w-3.5 h-3.5" />
                                        {seq.active_enrollments || 0}
                                    </div>
                                    <div className="text-[10px] uppercase tracking-wider mt-0.5">Active</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/dashboard/sequences/${seq.id}`}>View</Link>
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Pause Sequence</DropdownMenuItem>
                                        <DropdownMenuItem>Edit Steps</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
