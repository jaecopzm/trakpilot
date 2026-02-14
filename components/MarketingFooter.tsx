import React from 'react';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function MarketingFooter() {
    return (
        <footer className="border-t border-border/50 py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-3">
                            <div className="bg-primary/10 p-1.5 rounded-md border border-primary/20">
                                <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-semibold">MailTrackr</span>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            The simplest email tracking tool for sales professionals.
                            Know when your emails are opened.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm mb-3">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                            <li><Link href="/#faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm mb-3">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <Separator className="my-8 bg-border/50" />
                <p className="text-sm text-muted-foreground text-center">
                    © {new Date().getFullYear()} MailTrackr. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
