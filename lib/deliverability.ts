// Advanced deliverability checker
export interface DeliverabilityScore {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: DeliverabilityIssue[];
  recommendations: string[];
}

export interface DeliverabilityIssue {
  severity: 'critical' | 'warning' | 'info';
  category: 'content' | 'technical' | 'authentication' | 'reputation';
  message: string;
  fix: string;
}

export function checkDeliverability(
  subject: string,
  body: string,
  fromEmail: string,
  hasCustomDomain: boolean,
  hasSPF: boolean = false,
  hasDKIM: boolean = false,
  hasDMARC: boolean = false
): DeliverabilityScore {
  const issues: DeliverabilityIssue[] = [];
  let score = 100;

  // Content checks
  const spamWords = ['free', 'click here', 'act now', 'limited time', 'buy now', 'cash', 'winner', 'congratulations'];
  const foundSpamWords = spamWords.filter(word => 
    subject.toLowerCase().includes(word) || body.toLowerCase().includes(word)
  );
  
  if (foundSpamWords.length > 0) {
    score -= foundSpamWords.length * 5;
    issues.push({
      severity: 'warning',
      category: 'content',
      message: `Spam trigger words found: ${foundSpamWords.join(', ')}`,
      fix: 'Replace these words with more professional alternatives'
    });
  }

  // Subject line checks
  if (subject.length === 0) {
    score -= 15;
    issues.push({
      severity: 'critical',
      category: 'content',
      message: 'Missing subject line',
      fix: 'Add a clear, descriptive subject line'
    });
  } else if (subject.length > 60) {
    score -= 5;
    issues.push({
      severity: 'info',
      category: 'content',
      message: 'Subject line too long (>60 chars)',
      fix: 'Keep subject lines under 60 characters for better mobile display'
    });
  }

  if (subject.toUpperCase() === subject && subject.length > 5) {
    score -= 10;
    issues.push({
      severity: 'warning',
      category: 'content',
      message: 'Subject line is all caps',
      fix: 'Use normal capitalization'
    });
  }

  if ((subject.match(/!/g) || []).length > 1) {
    score -= 5;
    issues.push({
      severity: 'warning',
      category: 'content',
      message: 'Too many exclamation marks in subject',
      fix: 'Use at most one exclamation mark'
    });
  }

  // Body content checks
  const linkCount = (body.match(/<a\s+href=/gi) || []).length;
  if (linkCount > 10) {
    score -= 10;
    issues.push({
      severity: 'warning',
      category: 'content',
      message: `Too many links (${linkCount})`,
      fix: 'Reduce to 5-7 links maximum'
    });
  }

  if (!body.includes('unsubscribe')) {
    score -= 15;
    issues.push({
      severity: 'critical',
      category: 'content',
      message: 'Missing unsubscribe link',
      fix: 'Add an unsubscribe link (automatically added by system)'
    });
  }

  const imageCount = (body.match(/<img/gi) || []).length;
  const textLength = body.replace(/<[^>]*>/g, '').length;
  if (imageCount > 0 && textLength < 100) {
    score -= 10;
    issues.push({
      severity: 'warning',
      category: 'content',
      message: 'Image-to-text ratio too high',
      fix: 'Add more text content to balance images'
    });
  }

  // Technical/Authentication checks
  if (!hasCustomDomain) {
    score -= 10;
    issues.push({
      severity: 'warning',
      category: 'technical',
      message: 'Using shared domain',
      fix: 'Configure a custom domain for better deliverability'
    });
  }

  if (!hasSPF) {
    score -= 15;
    issues.push({
      severity: 'critical',
      category: 'authentication',
      message: 'SPF record not configured',
      fix: 'Add SPF record to your domain DNS'
    });
  }

  if (!hasDKIM) {
    score -= 15;
    issues.push({
      severity: 'critical',
      category: 'authentication',
      message: 'DKIM not configured',
      fix: 'Enable DKIM signing for your domain'
    });
  }

  if (!hasDMARC) {
    score -= 10;
    issues.push({
      severity: 'warning',
      category: 'authentication',
      message: 'DMARC policy not set',
      fix: 'Add DMARC record to your domain DNS'
    });
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Generate recommendations
  const recommendations: string[] = [];
  if (score < 70) {
    recommendations.push('Fix critical issues before sending');
  }
  if (!hasCustomDomain) {
    recommendations.push('Set up a custom domain to improve sender reputation');
  }
  if (!hasSPF || !hasDKIM) {
    recommendations.push('Configure email authentication (SPF, DKIM, DMARC)');
  }
  if (foundSpamWords.length > 0) {
    recommendations.push('Revise content to avoid spam trigger words');
  }

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return { score, grade, issues, recommendations };
}
