import React from 'react';
import { Metadata } from 'next';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export const metadata: Metadata = {
    title: 'Terms of Service — MailTrackr',
    description: 'Read the terms and conditions for using the MailTrackr service.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col ambient-bg">
            <MarketingNav />

            <main className="flex-1 py-24 px-6">
                <article className="max-w-3xl mx-auto prose-invert">
                    <p className="text-xs text-muted-foreground mb-2">Last updated: February 13, 2026</p>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
                    <p className="text-muted-foreground mb-12 text-lg">
                        Please read these terms carefully before using MailTrackr.
                    </p>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            By accessing or using MailTrackr (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, you may not use the Service. We reserve the right to
                            update these terms at any time, and will notify you of material changes via email or an in-app notification.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">2. Account Terms</h2>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
                            <li>You must be at least 18 years old to use this Service.</li>
                            <li>You must provide accurate and complete registration information.</li>
                            <li>You are responsible for maintaining the security of your account and password.</li>
                            <li>You are responsible for all activity that occurs under your account.</li>
                            <li>One person or legal entity may not maintain more than one free account.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">3. Acceptable Use</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                            You agree not to use MailTrackr for any unlawful purpose or in ways that could harm
                            the Service or other users. Specifically, you must not:
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-2">
                            <li>Use the Service to send spam or unsolicited bulk emails.</li>
                            <li>Track emails without a legitimate business purpose.</li>
                            <li>Attempt to gain unauthorized access to any part of the Service.</li>
                            <li>Reverse engineer, decompile, or disassemble the Service.</li>
                            <li>Use the Service to violate any applicable laws or regulations, including privacy laws like GDPR or CAN-SPAM.</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">4. Pricing & Payment</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The Free plan is available at no charge with limited features. Paid plans are billed
                            monthly or annually as specified at the time of purchase. Prices may change with 30 days&apos;
                            notice. All fees are non-refundable, except as required by law or as explicitly stated in
                            our refund policy (14-day money-back guarantee for annual plans).
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">5. Usage Limits</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Free accounts are limited to 10 tracked emails per month. If you exceed your
                            plan&apos;s limits, we may restrict your ability to create new trackers until you
                            upgrade or until the next billing cycle. We reserve the right to enforce fair usage
                            policies on all plans.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The Service and its original content, features, and functionality are owned by
                            MailTrackr and are protected by international copyright, trademark, and other
                            intellectual property laws. Your data remains yours — we claim no ownership over the
                            content you create or track through the Service.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">7. Cancellation & Termination</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            You can cancel your account at any time from your dashboard settings. Upon cancellation,
                            your data will be retained for 30 days and then permanently deleted. We may also
                            terminate or suspend your account without notice if you violate these Terms.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            To the fullest extent permitted by law, MailTrackr shall not be liable for any
                            indirect, incidental, special, consequential, or punitive damages, or any loss of
                            profits or revenues, whether incurred directly or indirectly. Our total liability
                            shall not exceed the amount you paid us in the 12 months prior to the claim.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
                            either express or implied. We do not guarantee that the Service will be uninterrupted,
                            secure, or error-free. Email tracking depends on the recipient&apos;s email client loading
                            images, which is beyond our control.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            These Terms shall be governed by and construed in accordance with the laws of the
                            jurisdiction in which MailTrackr operates, without regard to its conflict of law provisions.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            If you have questions about these Terms, please contact us at{' '}
                            <a href="mailto:legal@mailtrackr.io" className="text-primary hover:underline">
                                legal@mailtrackr.io
                            </a>.
                        </p>
                    </section>
                </article>
            </main>

            <MarketingFooter />
        </div>
    );
}
