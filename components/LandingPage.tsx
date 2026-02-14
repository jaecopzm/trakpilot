import React from 'react';
import {
    Mail, Eye, Zap, BarChart3, Shield, Bell, CheckCircle, ArrowRight, ChevronDown,
    ShieldCheck, MousePointerClick, Globe, Clock, Sparkles
} from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

const features = [
    {
        icon: Eye,
        title: 'Invisible Tracking',
        description: 'A 1x1 transparent pixel that is completely invisible to recipients. No banners, no warnings.',
    },
    {
        icon: ShieldCheck,
        title: 'Human-Only Analytics',
        description: 'Proactive detection filters out opens from Apple Mail Privacy Protection and corporate security bots.',
    },
    {
        icon: Sparkles,
        title: 'Lead Heat Scoring',
        description: 'Identify your hottest prospects automatically. Scoring logic weights clicks and real opens.',
    },
    {
        icon: Clock,
        title: 'Time Intelligence',
        description: 'Know exactly when to follow up. We analyze historical patterns to suggest the best time to send.',
    },
    {
        icon: MousePointerClick,
        title: 'Link Click Tracking',
        description: 'Track every link in your email to see what content actually resonates with your audience.',
    },
    {
        icon: Globe,
        title: 'Custom Domains',
        description: 'White-label your tracking links. Use your own subdomain for better deliverability and trust.',
    },
];

const freePlanFeatures = [
    '10 tracked emails/month',
    'Open count tracking',
    'Basic dashboard',
    'Email support',
];

const proPlanFeatures = [
    'Unlimited email tracking',
    'Human-only open detection',
    'Lead Heat Scoring',
    'Best Time recommendations',
    'Custom Tracking Domains',
    'Link click tracking',
    'Chrome Extension (Coming soon)',
    'API access',
];

const faqs = [
    {
        q: 'How does email tracking work?',
        a: 'When you generate a tracking pixel, we create a tiny invisible 1x1 image. You paste the HTML code into your email. When the recipient opens the email and loads images, our server records the open.',
    },
    {
        q: 'Will the recipient know they are being tracked?',
        a: 'The tracking pixel is completely invisible — it\'s a 1x1 transparent GIF. Most email clients load it automatically with no indication to the recipient.',
    },
    {
        q: 'What email clients are supported?',
        a: 'MailTrackr works with any email client that loads images, including Gmail, Outlook, Yahoo Mail, Apple Mail, Thunderbird, and more.',
    },
    {
        q: 'Can I cancel my subscription anytime?',
        a: 'Yes, you can cancel your Pro subscription at any time. You\'ll continue to have access until the end of your billing period.',
    },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col ambient-bg">
            <MarketingNav />

            {/* Hero */}
            <section className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
                <Badge variant="secondary" className="mb-6 text-xs font-medium px-3 py-1 gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    Now with real-time tracking
                </Badge>

                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]">
                    Know when your{' '}
                    <span className="text-primary">
                        emails are opened
                    </span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-2xl mt-6 leading-relaxed">
                    The simplest invisible email tracking tool for sales professionals.
                    Generate a pixel, paste it in your email, and get notified when it&apos;s opened.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-10">
                    <SignedOut>
                        <SignUpButton mode="modal">
                            <Button size="lg" className="text-base px-8">
                                Start Tracking Free
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </SignUpButton>
                        <SignInButton mode="modal">
                            <Button variant="outline" size="lg" className="text-base px-8">
                                Sign In
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard">
                            <Button size="lg" className="text-base px-8">
                                Go to Dashboard
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </SignedIn>
                </div>

                {/* Social Proof Stats */}
                <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl w-full">
                    {[
                        { label: 'Emails Tracked', value: '1M+' },
                        { label: 'Active Users', value: '10k+' },
                        { label: 'Open Rate Boost', value: '35%' },
                    ].map((stat, i) => (
                        <Card key={i} className="bg-card/50 border-border/50">
                            <CardContent className="p-6 text-center">
                                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge variant="secondary" className="mb-4 text-xs">Features</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Everything you need to track emails
                        </h2>
                        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                            Simple, powerful, and invisible. Built for sales professionals who need to know.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((feature, i) => (
                            <Card key={i} className="bg-card/50 border-border/50 hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5">
                                <CardHeader className="pb-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                                        <feature.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-base">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-24 px-6 border-t border-border/50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge variant="secondary" className="mb-4 text-xs">Pricing</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                            Start free and upgrade when you&apos;re ready. No hidden fees, cancel anytime.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {/* Free Plan */}
                        <Card className="bg-card/50 border-border/50">
                            <CardHeader>
                                <CardTitle className="text-xl">Free</CardTitle>
                                <CardDescription>For getting started</CardDescription>
                                <div className="pt-4">
                                    <span className="text-4xl font-bold">$0</span>
                                    <span className="text-muted-foreground ml-1">/month</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {freePlanFeatures.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                            <CheckCircle className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <SignedOut>
                                    <SignUpButton mode="modal">
                                        <Button variant="outline" className="w-full">
                                            Get Started Free
                                        </Button>
                                    </SignUpButton>
                                </SignedOut>
                                <SignedIn>
                                    <Link href="/dashboard" className="w-full">
                                        <Button variant="outline" className="w-full">
                                            Go to Dashboard
                                        </Button>
                                    </Link>
                                </SignedIn>
                            </CardFooter>
                        </Card>

                        {/* Pro Plan */}
                        <Card className="border-primary/30 bg-card/50 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl">Pro</CardTitle>
                                    <Badge className="text-xs">Popular</Badge>
                                </div>
                                <CardDescription>For serious sales reps</CardDescription>
                                <div className="pt-4">
                                    <span className="text-4xl font-bold">$19</span>
                                    <span className="text-muted-foreground ml-1">/month</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {proPlanFeatures.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2.5 text-sm text-foreground/80">
                                            <CheckCircle className="w-4 h-4 text-success shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full">
                                    Subscribe Now
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-24 px-6 border-t border-border/50">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge variant="secondary" className="mb-4 text-xs">FAQ</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Frequently asked questions
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <Card key={i} className="bg-card/50 border-border/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-medium">{faq.q}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {faq.a}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 border-t border-border/50">
                <div className="max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Ready to track your emails?
                    </h2>
                    <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
                        Join thousands of sales professionals who never wonder if their emails were read.
                    </p>
                    <div className="mt-8">
                        <SignedOut>
                            <SignUpButton mode="modal">
                                <Button size="lg" className="text-base px-8">
                                    Start Free Today
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/dashboard">
                                <Button size="lg" className="text-base px-8">
                                    Go to Dashboard
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </SignedIn>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
}
