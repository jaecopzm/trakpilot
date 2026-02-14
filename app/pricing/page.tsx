'use client';

import React, { useState } from 'react';
import { CheckCircle, ArrowRight, X, Sparkles, Zap, Building2 } from 'lucide-react';
import { SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

const plans = [
    {
        name: 'Free',
        description: 'For getting started',
        icon: Zap,
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
            { text: '10 tracked emails/month', included: true },
            { text: 'Open count tracking', included: true },
            { text: 'Basic dashboard', included: true },
            { text: 'Email support', included: true },
            { text: 'Advanced analytics', included: false },
            { text: 'Real-time notifications', included: false },
            { text: 'Chrome Extension', included: false },
            { text: 'API access', included: false },
        ],
        cta: 'Get Started Free',
        highlighted: false,
    },
    {
        name: 'Pro',
        description: 'For serious sales reps',
        icon: Sparkles,
        monthlyPrice: 12,
        yearlyPrice: 8,
        features: [
            { text: 'Unlimited email tracking', included: true },
            { text: 'Open count tracking', included: true },
            { text: 'Advanced dashboard', included: true },
            { text: 'Priority support', included: true },
            { text: 'Advanced analytics & charts', included: true },
            { text: 'Real-time Slack notifications', included: true },
            { text: 'Chrome Extension', included: true },
            { text: 'API access', included: true },
        ],
        cta: 'Subscribe Now',
        highlighted: true,
    },
    {
        name: 'Enterprise',
        description: 'For teams & organizations',
        icon: Building2,
        monthlyPrice: null,
        yearlyPrice: null,
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Unlimited team members', included: true },
            { text: 'Team dashboard', included: true },
            { text: 'Dedicated support', included: true },
            { text: 'Custom integrations', included: true },
            { text: 'SSO / SAML', included: true },
            { text: 'Custom domain', included: true },
            { text: 'SLA guarantee', included: true },
        ],
        cta: 'Contact Sales',
        highlighted: false,
    },
];

const faqs = [
    {
        q: 'How does the free plan work?',
        a: 'You can track up to 10 emails per month at no cost. No credit card required to sign up.',
    },
    {
        q: 'Can I upgrade or downgrade anytime?',
        a: 'Yes, you can change your plan at any time. When upgrading, you\'ll be charged a prorated amount. When downgrading, you\'ll keep access until the end of your billing period.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, Mastercard, American Express) and also support payments via PayPal.',
    },
    {
        q: 'Is there a money-back guarantee?',
        a: 'Yes! We offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied, we\'ll refund your payment.',
    },
    {
        q: 'What happens if I hit my email limit on the Free plan?',
        a: 'You\'ll receive a notification when you\'re close to the limit. Once reached, you won\'t be able to create new trackers until the next month or until you upgrade.',
    },
];

const comparisonFeatures = [
    { name: 'Tracked Emails', free: '10/month', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Open Tracking', free: '✓', pro: '✓', enterprise: '✓' },
    { name: 'Dashboard', free: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
    { name: 'Analytics', free: '—', pro: '✓', enterprise: '✓' },
    { name: 'Slack Notifications', free: '—', pro: '✓', enterprise: '✓' },
    { name: 'Chrome Extension', free: '—', pro: '✓', enterprise: '✓' },
    { name: 'API Access', free: '—', pro: '✓', enterprise: '✓' },
    { name: 'Team Members', free: '1', pro: '1', enterprise: 'Unlimited' },
    { name: 'SSO / SAML', free: '—', pro: '—', enterprise: '✓' },
    { name: 'Support', free: 'Email', pro: 'Priority', enterprise: 'Dedicated' },
];

export default function PricingPage() {
    const [annual, setAnnual] = useState(false);

    return (
        <div className="min-h-screen flex flex-col ambient-bg">
            <MarketingNav />

            {/* Hero */}
            <section className="pt-24 pb-16 px-6 text-center">
                <Badge variant="secondary" className="mb-6 text-xs font-medium px-3 py-1 gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    Simple pricing, no surprises
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.1]">
                    Choose the plan that{' '}
                    <span className="text-primary">fits your needs</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed">
                    Start free, upgrade when you&apos;re ready. All plans include core tracking features.
                    No hidden fees, cancel anytime.
                </p>

                {/* Annual / Monthly Toggle */}
                <div className="flex items-center justify-center gap-4 mt-10">
                    <span className={`text-sm font-medium ${!annual ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Monthly
                    </span>
                    <button
                        onClick={() => setAnnual(!annual)}
                        className={`
                            relative w-12 h-6 rounded-full transition-colors duration-300
                            ${annual ? 'bg-primary' : 'bg-muted'}
                        `}
                    >
                        <div
                            className={`
                                absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300
                                ${annual ? 'translate-x-6' : 'translate-x-0.5'}
                            `}
                        />
                    </button>
                    <span className={`text-sm font-medium ${annual ? 'text-foreground' : 'text-muted-foreground'}`}>
                        Annual
                    </span>
                    {annual && (
                        <Badge className="text-xs bg-success/10 text-success border-success/20">
                            Save 33%
                        </Badge>
                    )}
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="px-6 pb-24">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan, i) => (
                        <Card
                            key={i}
                            className={`
                                relative overflow-hidden transition-all duration-300 hover:-translate-y-1
                                ${plan.highlighted
                                    ? 'border-primary/30 bg-card/50 shadow-lg shadow-primary/5'
                                    : 'bg-card/50 border-border/50'
                                }
                            `}
                        >
                            {plan.highlighted && (
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                            )}
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${plan.highlighted ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50 border border-border/50'}`}>
                                            <plan.icon className={`w-4 h-4 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                                        </div>
                                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                                    </div>
                                    {plan.highlighted && <Badge className="text-xs">Popular</Badge>}
                                </div>
                                <CardDescription className="mt-1">{plan.description}</CardDescription>
                                <div className="pt-4">
                                    {plan.monthlyPrice !== null ? (
                                        <>
                                            <span className="text-4xl font-bold">
                                                ${annual ? plan.yearlyPrice : plan.monthlyPrice}
                                            </span>
                                            <span className="text-muted-foreground ml-1">/month</span>
                                            {annual && plan.monthlyPrice > 0 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Billed annually (${plan.yearlyPrice! * 12}/year)
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-3xl font-bold">Custom</span>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Tailored to your team
                                            </p>
                                        </>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, j) => (
                                        <li key={j} className={`flex items-center gap-2.5 text-sm ${feature.included ? (plan.highlighted ? 'text-foreground/80' : 'text-muted-foreground') : 'text-muted-foreground/40'}`}>
                                            {feature.included ? (
                                                <CheckCircle className={`w-4 h-4 shrink-0 ${plan.highlighted ? 'text-success' : 'text-muted-foreground/60'}`} />
                                            ) : (
                                                <X className="w-4 h-4 shrink-0" />
                                            )}
                                            {feature.text}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                {plan.monthlyPrice === null ? (
                                    <Button variant="outline" className="w-full">
                                        {plan.cta}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : plan.monthlyPrice === 0 ? (
                                    <>
                                        <SignedOut>
                                            <SignUpButton mode="modal">
                                                <Button variant="outline" className="w-full">
                                                    {plan.cta}
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
                                    </>
                                ) : (
                                    <Button className="w-full">
                                        {plan.cta}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Feature Comparison Table */}
            <section className="px-6 pb-24 border-t border-border/50 pt-24">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight">Compare Plans</h2>
                        <p className="text-muted-foreground mt-3">
                            A detailed look at what&apos;s included in each plan
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
                                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Free</th>
                                    <th className="text-center py-3 px-4 font-medium text-primary">Pro</th>
                                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonFeatures.map((row, i) => (
                                    <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                                        <td className="py-3 px-4 font-medium">{row.name}</td>
                                        <td className="py-3 px-4 text-center text-muted-foreground">{row.free}</td>
                                        <td className="py-3 px-4 text-center font-medium">{row.pro}</td>
                                        <td className="py-3 px-4 text-center text-muted-foreground">{row.enterprise}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 px-6 border-t border-border/50">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-16">
                        <Badge variant="secondary" className="mb-4 text-xs">FAQ</Badge>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Pricing questions
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

            <MarketingFooter />
        </div>
    );
}
