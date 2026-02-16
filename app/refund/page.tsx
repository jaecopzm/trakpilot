import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';

export default function RefundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1 py-16 px-6">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1>Refund Policy</h1>
          <p className="text-muted-foreground">Last updated: February 16, 2026</p>

          <h2>1. 14-Day Money-Back Guarantee</h2>
          <p>
            We offer a <strong>14-day money-back guarantee</strong> for all new Pro plan subscriptions. 
            If you're not satisfied with MailTrackr, you can request a full refund within 14 days of your initial purchase.
          </p>

          <h2>2. Eligibility for Refunds</h2>
          
          <h3>2.1 Eligible for Refund</h3>
          <ul>
            <li>New Pro plan subscriptions (first-time purchases)</li>
            <li>Requests made within 14 days of the initial purchase date</li>
            <li>Accounts in good standing (no Terms of Service violations)</li>
          </ul>

          <h3>2.2 Not Eligible for Refund</h3>
          <ul>
            <li>Subscription renewals (monthly or annual)</li>
            <li>Requests made after the 14-day period</li>
            <li>Partial months of service</li>
            <li>Accounts terminated for violating our Terms of Service</li>
            <li>Free plan users (no payment made)</li>
            <li>Chargebacks or disputed payments</li>
          </ul>

          <h2>3. How to Request a Refund</h2>
          <p>To request a refund, please follow these steps:</p>
          <ol>
            <li>Email us at <strong>support@mailtrackr.zedbeatz.com</strong></li>
            <li>Include your account email address</li>
            <li>Provide your order/transaction ID (if available)</li>
            <li>Briefly explain your reason for the refund request (optional but helpful)</li>
          </ol>
          <p>
            We aim to process all refund requests within <strong>3-5 business days</strong>.
          </p>

          <h2>4. Refund Processing</h2>
          
          <h3>4.1 Processing Time</h3>
          <ul>
            <li><strong>Approval:</strong> 1-2 business days</li>
            <li><strong>Paddle Processing:</strong> 2-3 business days</li>
            <li><strong>Bank/Card Processing:</strong> 5-10 business days (varies by institution)</li>
          </ul>

          <h3>4.2 Refund Method</h3>
          <p>
            Refunds are processed through Paddle, our payment processor, and will be returned to your original payment method:
          </p>
          <ul>
            <li>Credit/Debit Card: Refunded to the original card</li>
            <li>PayPal: Refunded to your PayPal account</li>
            <li>Other methods: Refunded via the original payment method</li>
          </ul>

          <h2>5. Subscription Cancellation</h2>
          <p>
            You can cancel your subscription at any time without requesting a refund. 
            When you cancel:
          </p>
          <ul>
            <li>You retain access until the end of your current billing period</li>
            <li>No further charges will be made</li>
            <li>Your account will revert to the Free plan after the period ends</li>
            <li>Your data will be retained according to our Privacy Policy</li>
          </ul>
          <p>
            To cancel your subscription, go to <strong>Settings → Billing</strong> in your dashboard.
          </p>

          <h2>6. Prorated Refunds</h2>
          <p>
            We do not offer prorated refunds for:
          </p>
          <ul>
            <li>Mid-cycle cancellations</li>
            <li>Downgrades from Pro to Free</li>
            <li>Unused portions of your subscription</li>
          </ul>
          <p>
            However, you will retain full access to Pro features until the end of your billing period.
          </p>

          <h2>7. Annual Subscriptions</h2>
          <p>
            Annual subscriptions are eligible for refunds within 14 days of the initial purchase. 
            After 14 days, annual subscriptions are non-refundable but can be cancelled to prevent future renewals.
          </p>

          <h2>8. Failed Payments and Retries</h2>
          <p>
            If a payment fails:
          </p>
          <ul>
            <li>We will attempt to retry the payment 2-3 times over 7 days</li>
            <li>You will receive email notifications about failed payments</li>
            <li>Your account will be downgraded to Free if payment cannot be processed</li>
            <li>No refunds are issued for failed payments</li>
          </ul>

          <h2>9. Chargebacks</h2>
          <p>
            <strong>Please contact us before initiating a chargeback.</strong> Chargebacks:
          </p>
          <ul>
            <li>Result in immediate account suspension</li>
            <li>Incur additional processing fees</li>
            <li>May prevent future use of the Service</li>
            <li>Are not eligible for our refund policy</li>
          </ul>
          <p>
            We're committed to resolving any billing issues directly and quickly.
          </p>

          <h2>10. Exceptional Circumstances</h2>
          <p>
            In exceptional circumstances (e.g., service outages, billing errors), we may offer refunds or credits 
            outside of this policy at our sole discretion.
          </p>

          <h2>11. Currency and Exchange Rates</h2>
          <p>
            Refunds are processed in the original currency of purchase. 
            Any currency conversion fees or exchange rate differences are the responsibility of your financial institution.
          </p>

          <h2>12. Tax Refunds</h2>
          <p>
            If applicable taxes (VAT, GST, etc.) were charged on your purchase, they will be included in your refund. 
            Tax refund processing may vary by jurisdiction.
          </p>

          <h2>13. Account Deletion</h2>
          <p>
            Requesting a refund does not automatically delete your account. If you wish to delete your account and data:
          </p>
          <ol>
            <li>Go to Settings → Account</li>
            <li>Click "Delete Account"</li>
            <li>Confirm deletion</li>
          </ol>
          <p>
            Account deletion is permanent and cannot be undone.
          </p>

          <h2>14. Changes to This Policy</h2>
          <p>
            We reserve the right to modify this Refund Policy at any time. 
            Changes will be effective immediately upon posting. Continued use of the Service after changes 
            constitutes acceptance of the modified policy.
          </p>

          <h2>15. Questions and Support</h2>
          <p>
            If you have questions about our refund policy or need assistance with a refund request, please contact us:
          </p>
          <p>
            Email: <strong>support@mailtrackr.zedbeatz.com</strong><br />
            Subject Line: "Refund Request - [Your Email]"<br />
            Response Time: Within 24-48 hours
          </p>

          <h2>16. Dispute Resolution</h2>
          <p>
            If you're not satisfied with our refund decision, you may:
          </p>
          <ul>
            <li>Request escalation to a senior support team member</li>
            <li>Contact Paddle's support team directly</li>
            <li>Seek resolution through your payment provider (as a last resort)</li>
          </ul>

          <div className="bg-muted p-6 rounded-lg mt-8">
            <h3 className="mt-0">Quick Summary</h3>
            <ul className="mb-0">
              <li>✅ 14-day money-back guarantee for new subscriptions</li>
              <li>✅ Full refund, no questions asked</li>
              <li>✅ 3-5 business day processing time</li>
              <li>❌ No refunds for renewals or after 14 days</li>
              <li>❌ No prorated refunds for cancellations</li>
            </ul>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
