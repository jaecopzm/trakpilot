import React from 'react';
import { Metadata } from 'next';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export const metadata: Metadata = {
    title: 'Privacy Policy — MailTrackr',
    description: 'Learn how MailTrackr collects, uses, and protects your data.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col ambient-bg">
            <MarketingNav />

            <main className="flex-1 py-24 px-6">
                <article className="max-w-3xl mx-auto prose-invert">
                    <p className="text-xs text-muted-foreground mb-2">Last updated: February 13, 2026</p>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
                    <p className="text-muted-foreground mb-12 text-lg">
                        Your privacy matters to us. This policy explains how MailTrackr handles your information.
                    </p>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            When you sign up for MailTrackr, we collect information you provide directly, including:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
                            <li><strong className="text-foreground">Account data:</strong> Name, email address, and authentication details (managed by Clerk).</li>
                            <li><strong className="text-foreground">Tracking data:</strong> Recipient email addresses, subject references, and tracking pixel open events.</li>
                            <li><strong className="text-foreground">Open event data:</strong> IP address, user agent, device type, and approximate location of email opens.</li>
                            <li><strong className="text-foreground">Payment data:</strong> Billing information is processed by our payment provider and never stored on our servers.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">2. How We Use Your Data</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            We use your information to:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
                            <li>Provide and maintain the MailTrackr service, including email tracking and analytics.</li>
                            <li>Send you service-related notifications, such as open alerts and account updates.</li>
                            <li>Improve our product and develop new features based on usage patterns.</li>
                            <li>Protect against fraud, abuse, and unauthorized access.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">3. Cookies & Tracking Technologies</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            MailTrackr uses essential cookies to maintain your session and authentication state.
                            Our tracking pixel technology uses a transparent 1x1 GIF image embedded in emails to detect
                            when an email is opened. This pixel records the IP address, user agent, and timestamp of
                            the request. We do not use third-party advertising cookies.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">4. Data Sharing & Third Parties</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            We do not sell your personal data. We may share data with the following service providers:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
                            <li><strong className="text-foreground">Clerk:</strong> Authentication and user management.</li>
                            <li><strong className="text-foreground">Turso (LibSQL):</strong> Database hosting and storage.</li>
                            <li><strong className="text-foreground">Vercel:</strong> Application hosting and deployment.</li>
                            <li><strong className="text-foreground">Slack:</strong> If you enable Slack notifications, open events are sent to your configured webhook.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">5. Data Retention</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We retain your account data and tracking data for as long as your account is active.
                            When you delete a tracked email, its associated open events are also permanently deleted.
                            If you close your account, all data is removed within 30 days.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">6. Your Rights (GDPR)</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            If you are located in the European Economic Area, you have the right to:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
                            <li>Access and receive a copy of your personal data.</li>
                            <li>Rectify inaccurate personal data.</li>
                            <li>Request deletion of your personal data.</li>
                            <li>Object to or restrict the processing of your data.</li>
                            <li>Data portability — receive your data in a structured format.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">7. Security</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We use industry-standard security measures, including HTTPS encryption,
                            secure authentication via Clerk, and access-controlled database infrastructure.
                            While no system is perfectly secure, we take reasonable precautions to protect your data.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            If you have questions about this Privacy Policy or your data, please contact us at{' '}
                            <a href="mailto:privacy@mailtrackr.io" className="text-primary hover:underline">
                                privacy@mailtrackr.io
                            </a>.
                        </p>
                    </section>
                </article>
            </main>

            <MarketingFooter />
        </div>
    );
}
