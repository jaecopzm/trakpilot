# Email Deliverability Setup

To prevent your emails from landing in spam, configure these DNS records for your domain:

## 1. SPF (Sender Policy Framework)

Add a TXT record to your domain:

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all
```

If using custom SMTP, add your SMTP server's IP:
```
v=spf1 ip4:YOUR_SMTP_IP include:_spf.mx.cloudflare.net ~all
```

## 2. DKIM (DomainKeys Identified Mail)

If using Resend:
1. Go to Resend dashboard → Domains
2. Add your domain
3. Copy the DKIM records provided
4. Add them to your DNS

If using custom SMTP (with nodemailer):
```bash
npm install nodemailer-dkim
```

Generate DKIM keys:
```bash
openssl genrsa -out dkim_private.pem 1024
openssl rsa -in dkim_private.pem -pubout -out dkim_public.pem
```

Add TXT record:
```
Type: TXT
Name: default._domainkey
Value: v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY
```

## 3. DMARC (Domain-based Message Authentication)

Add a TXT record:
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=100; adkim=s; aspf=s
```

Options:
- `p=none` - Monitor only (start here)
- `p=quarantine` - Send to spam if fails
- `p=reject` - Reject if fails (most strict)

## 4. Custom Domain Setup

In your `.env`:
```
CUSTOM_DOMAIN=yourdomain.com
```

In user settings, set:
- From Email: `noreply@yourdomain.com`
- Reply-To Email: `support@yourdomain.com`
- Display Name: Your Company Name

## 5. Verify DNS Records

```bash
# Check SPF
dig TXT yourdomain.com

# Check DKIM
dig TXT default._domainkey.yourdomain.com

# Check DMARC
dig TXT _dmarc.yourdomain.com
```

## 6. Test Email Deliverability

Send test emails to:
- mail-tester.com
- glockapps.com
- postmaster tools (Gmail, Outlook)

## Best Practices

1. **Warm up your domain** - Start with low volume, gradually increase
2. **Maintain good sender reputation** - Monitor bounce rates and complaints
3. **Use consistent From address** - Don't change frequently
4. **Include physical address** - Required by CAN-SPAM
5. **Easy unsubscribe** - One-click unsubscribe link
6. **Avoid spam trigger words** - Use the spam checker
7. **Balance text/HTML ratio** - Include plain text version
8. **Authenticate your domain** - Complete SPF, DKIM, DMARC setup
