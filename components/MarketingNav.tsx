import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function MarketingNav() {
    return (
        <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="bg-primary/10 p-2 rounded-lg border border-primary/20">
                        <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-foreground">
                        MailTrackr
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
                    <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
                    <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
                    <Link href="/#faq" className="hover:text-foreground transition-colors">FAQ</Link>
                </div>

                <div className="flex gap-3">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="ghost" size="sm">
                                Sign In
                            </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button size="sm">
                                Get Started
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard">
                            <Button size="sm">
                                Dashboard
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}
