'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft, Trash2, Clock, MoveDown, Save, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SequenceStep {
    id: string; // temp id for UI
    day_delay: number;
    subject: string;
    body: string;
}

export default function NewSequencePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [steps, setSteps] = useState<SequenceStep[]>([
        { id: '1', day_delay: 1, subject: '', body: '' }
    ]);
    const [saving, setSaving] = useState(false);

    const addStep = () => {
        setSteps([
            ...steps,
            { id: Math.random().toString(36), day_delay: 2, subject: '', body: '' }
        ]);
    };

    const removeStep = (index: number) => {
        if (steps.length === 1) return;
        const newSteps = [...steps];
        newSteps.splice(index, 1);
        setSteps(newSteps);
    };

    const updateStep = (index: number, field: keyof SequenceStep, value: string | number) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    };

    const handleSave = async () => {
        if (!name) {
            toast({ title: 'Error', description: 'Please name your sequence', variant: 'destructive' });
            return;
        }

        for (const step of steps) {
            if (!step.subject || !step.body) {
                toast({ title: 'Error', description: 'All steps must have a subject and body', variant: 'destructive' });
                return;
            }
        }

        setSaving(true);
        try {
            const res = await fetch('/api/sequences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, steps })
            });

            if (!res.ok) throw new Error('Failed to create sequence');

            toast({ title: 'Success', description: 'Sequence created successfully' });
            router.push('/dashboard/sequences');
        } catch (error) {
            toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">New Sequence</h1>
                    <p className="text-muted-foreground text-sm">Create an automated follow-up campaign</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>Saving...</>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Sequence
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <Label>Sequence Name</Label>
                <Input
                    placeholder="e.g. Cold Outreach Campaign Q1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg py-6"
                />
            </div>

            <div className="space-y-6 relative">
                <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-border -z-10" />

                {steps.map((step, index) => (
                    <div key={step.id} className="relative animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-start gap-4">
                            <div className="w-16 flex flex-col items-center gap-2 pt-4 bg-background z-10">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm ring-4 ring-background">
                                    {index + 1}
                                </div>
                                {index < steps.length - 1 && (
                                    <MoveDown className="w-4 h-4 text-muted-foreground/30 mt-2" />
                                )}
                            </div>

                            <Card className="flex-1 border-l-4 border-l-primary/50">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center justify-between pb-4 border-b">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">Wait</span>
                                            <Input
                                                type="number"
                                                min="1"
                                                className="w-16 h-8 text-center"
                                                value={step.day_delay}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStep(index, 'day_delay', parseInt(e.target.value))}
                                            />
                                            <span className="text-sm text-muted-foreground">day(s) after previous step</span>
                                        </div>
                                        {steps.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => removeStep(index)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Subject</Label>
                                        <Input
                                            placeholder="Subject line..."
                                            value={step.subject}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateStep(index, 'subject', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Body</Label>
                                        <Textarea
                                            placeholder="Write your email content here..."
                                            className="min-h-[200px] resize-y"
                                            value={step.body}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateStep(index, 'body', e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground text-right">
                                            Variables: {'{first_name}'}, {'{company}'} supported in future
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ))}

                <div className="pl-20 pt-4">
                    <Button variant="outline" className="border-dashed" onClick={addStep}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Follow-up Step
                    </Button>
                </div>
            </div>
        </div>
    );
}
