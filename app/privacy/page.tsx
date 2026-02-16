import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: February 16, 2026</p>

          <h2>1. Introduction</h2>
          <p>
            MailTrackr ("we", "our", or "us") is committed to protecting your privacy. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
          </p>

          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, password</li>
            <li><strong>Profile Information:</strong> Display name, reply-to email</li>
            <li><strong>Payment Information:</strong> Processed by Paddle (we do not store credit card details)</li>
            <li><strong>Email Content:</strong> Email subjects, bodies, and recipients you choose to track</li>
          </ul>

          <h3>2.2 Information Automatically Collected</h3>
          <ul>
            <li><strong>Tracking Data:</strong> Email open times, IP addresses, device types, locations, user agents</li>
            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Service</li>
            <li><strong>Device Information:</strong> Browser type, operating system, device identifiers</li>
            <li><strong>Cookies:</strong> Session cookies, authentication tokens, preference cookies</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information to:</p>
          <ul>
            <li>Provide, maintain, and improve the Service</li>
            <li>Process your transactions and send related information</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Analyze usage patterns and optimize the Service</li>
            <li>Detect, prevent, and address technical issues and fraud</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. Email Tracking</h2>
          <p>
            When you use our email tracking features, we collect information about email recipients who open your tracked emails:
          </p>
          <ul>
            <li>Email open times and frequency</li>
            <li>IP addresses and approximate locations</li>
            <li>Device types and email clients used</li>
            <li>Link clicks within tracked emails</li>
          </ul>
          <p>
            <strong>Important:</strong> You are responsible for complying with all applicable laws regarding email tracking, 
            including obtaining necessary consents from recipients where required.
          </p>

          <h2>5. Data Sharing and Disclosure</h2>
          
          <h3>5.1 We Do Not Sell Your Data</h3>
          <p>We do not sell, trade, or rent your personal information to third parties.</p>

          <h3>5.2 Service Providers</h3>
          <p>We may share your information with third-party service providers who perform services on our behalf:</p>
          <ul>
            <li><strong>Paddle:</strong> Payment processing</li>
            <li><strong>Clerk:</strong> Authentication services</li>
            <li><strong>Turso:</strong> Database hosting</li>
            <li><strong>Vercel:</strong> Application hosting</li>
            <li><strong>Resend:</strong> Email delivery (if configured)</li>
          </ul>

          <h3>5.3 Legal Requirements</h3>
          <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>

          <h2>6. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide you services. 
            You can request deletion of your account and associated data at any time.
          </p>
          <ul>
            <li><strong>Account Data:</strong> Retained until account deletion</li>
            <li><strong>Email Tracking Data:</strong> Retained for 12 months or until deletion</li>
            <li><strong>Payment Records:</strong> Retained for 7 years for tax compliance</li>
          </ul>

          <h2>7. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your information, including:
          </p>
          <ul>
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Encryption of sensitive data at rest</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure database hosting</li>
          </ul>
          <p>
            However, no method of transmission over the Internet or electronic storage is 100% secure. 
            We cannot guarantee absolute security.
          </p>

          <h2>8. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Export:</strong> Download your data in a portable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Object:</strong> Object to processing of your data</li>
          </ul>
          <p>To exercise these rights, contact us at privacy@mailtrackr.zedbeatz.com</p>

          <h2>9. GDPR Compliance (EU Users)</h2>
          <p>If you are in the European Economic Area (EEA), you have additional rights under GDPR:</p>
          <ul>
            <li>Right to data portability</li>
            <li>Right to restrict processing</li>
            <li>Right to object to automated decision-making</li>
            <li>Right to lodge a complaint with a supervisory authority</li>
          </ul>
          <p>
            Our legal basis for processing your data includes: consent, contract performance, 
            legal obligations, and legitimate interests.
          </p>

          <h2>10. CCPA Compliance (California Users)</h2>
          <p>California residents have the right to:</p>
          <ul>
            <li>Know what personal information is collected</li>
            <li>Know whether personal information is sold or disclosed</li>
            <li>Opt-out of the sale of personal information (we do not sell data)</li>
            <li>Request deletion of personal information</li>
            <li>Non-discrimination for exercising CCPA rights</li>
          </ul>

          <h2>11. Children's Privacy</h2>
          <p>
            Our Service is not intended for children under 13 years of age. 
            We do not knowingly collect personal information from children under 13. 
            If you become aware that a child has provided us with personal information, please contact us.
          </p>

          <h2>12. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own. 
            We ensure appropriate safeguards are in place for such transfers.
          </p>

          <h2>13. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar tracking technologies to:</p>
          <ul>
            <li>Maintain your session and authentication</li>
            <li>Remember your preferences</li>
            <li>Analyze usage patterns</li>
            <li>Improve the Service</li>
          </ul>
          <p>You can control cookies through your browser settings.</p>

          <h2>14. Third-Party Links</h2>
          <p>
            Our Service may contain links to third-party websites. We are not responsible for the privacy practices 
            of these external sites. We encourage you to read their privacy policies.
          </p>

          <h2>15. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
            the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          <p>
            Significant changes will be communicated via email or prominent notice on our Service.
          </p>

          <h2>16. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <p>
            Email: privacy@mailtrackr.zedbeatz.com<br />
            Support: support@mailtrackr.zedbeatz.com<br />
            Website: https://mailtrackr.zedbeatz.com
          </p>

          <h2>17. Data Protection Officer</h2>
          <p>
            For GDPR-related inquiries, you can contact our Data Protection Officer at: dpo@mailtrackr.zedbeatz.com
          </p>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
