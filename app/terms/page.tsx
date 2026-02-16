import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: February 16, 2026</p>

          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using MailTrackr ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
            If you disagree with any part of the terms, you may not access the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            MailTrackr provides email tracking and analytics services, including but not limited to:
          </p>
          <ul>
            <li>Email open tracking</li>
            <li>Link click tracking</li>
            <li>Email analytics and reporting</li>
            <li>AI-powered email optimization</li>
            <li>Email sequence automation</li>
          </ul>

          <h2>3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and current information. 
            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </p>
          <p>
            You are responsible for safeguarding the password and for all activities that occur under your account. 
            You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Send spam or unsolicited commercial emails</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Transmit malware, viruses, or harmful code</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use the Service for any illegal or unauthorized purpose</li>
          </ul>

          <h2>5. Subscription Plans</h2>
          <h3>5.1 Free Plan</h3>
          <p>
            The Free plan includes 50 tracked emails per month with basic features. 
            We reserve the right to modify or discontinue the Free plan at any time.
          </p>

          <h3>5.2 Pro Plan</h3>
          <p>
            The Pro plan is a paid subscription service billed monthly or annually. 
            Pricing is available on our pricing page and may be changed with 30 days notice.
          </p>

          <h2>6. Payment Terms</h2>
          <p>
            Payments are processed through Paddle.com Market Limited ("Paddle"), our Merchant of Record. 
            By subscribing to a paid plan, you agree to Paddle's terms and conditions.
          </p>
          <p>
            Subscriptions automatically renew unless cancelled before the renewal date. 
            You can cancel your subscription at any time from your account settings.
          </p>

          <h2>7. Refund Policy</h2>
          <p>
            We offer a 14-day money-back guarantee for new Pro subscriptions. 
            To request a refund, contact us at support@mailtrackr.zedbeatz.com within 14 days of your initial purchase.
          </p>
          <p>
            Refunds are not available for:
          </p>
          <ul>
            <li>Subscription renewals</li>
            <li>Partial months of service</li>
            <li>Accounts terminated for Terms violations</li>
          </ul>

          <h2>8. Data Usage and Privacy</h2>
          <p>
            Your use of the Service is also governed by our Privacy Policy. 
            By using the Service, you consent to the collection and use of information as described in our Privacy Policy.
          </p>

          <h2>9. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by MailTrackr and are protected by 
            international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            In no event shall MailTrackr, nor its directors, employees, partners, agents, suppliers, or affiliates, 
            be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, 
            loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul>
            <li>Your access to or use of or inability to access or use the Service</li>
            <li>Any conduct or content of any third party on the Service</li>
            <li>Any content obtained from the Service</li>
            <li>Unauthorized access, use or alteration of your transmissions or content</li>
          </ul>

          <h2>11. Service Availability</h2>
          <p>
            We strive to provide 99.9% uptime but do not guarantee uninterrupted access to the Service. 
            We may suspend or terminate the Service for maintenance, updates, or other reasons without prior notice.
          </p>

          <h2>12. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, 
            for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
          <p>
            Upon termination, your right to use the Service will immediately cease. 
            All provisions of the Terms which by their nature should survive termination shall survive termination.
          </p>

          <h2>13. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. 
            If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
          </p>

          <h2>14. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which 
            MailTrackr operates, without regard to its conflict of law provisions.
          </p>

          <h2>15. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            Email: support@mailtrackr.zedbeatz.com<br />
            Website: https://mailtrackr.zedbeatz.com
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
