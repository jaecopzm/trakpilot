const SPAM_TRIGGERS = [
  'free money', 'click here', 'act now', 'limited time', 'urgent',
  'congratulations', 'you won', 'winner', 'cash bonus', 'risk-free',
  '100% free', 'no cost', 'double your', 'earn money', 'extra income',
  'work from home', 'be your own boss', 'multi-level marketing',
  'viagra', 'cialis', 'weight loss', 'lose weight fast',
  'dear friend', 'this is not spam', 'remove from list'
];

export function checkSpamScore(subject: string, body: string): {
  score: number;
  triggers: string[];
  warnings: string[];
} {
  const text = `${subject} ${body}`.toLowerCase();
  const triggers: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  // Check spam trigger words
  SPAM_TRIGGERS.forEach(trigger => {
    if (text.includes(trigger)) {
      triggers.push(trigger);
      score += 2;
    }
  });

  // Excessive caps
  const capsRatio = (subject.match(/[A-Z]/g) || []).length / subject.length;
  if (capsRatio > 0.5 && subject.length > 5) {
    warnings.push('Too many capital letters in subject');
    score += 3;
  }

  // Excessive exclamation marks
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 3) {
    warnings.push('Too many exclamation marks');
    score += 2;
  }

  // Missing unsubscribe (checked elsewhere)
  if (!body.includes('unsubscribe')) {
    warnings.push('Missing unsubscribe link');
    score += 5;
  }

  // Short subject
  if (subject.length < 3) {
    warnings.push('Subject too short');
    score += 1;
  }

  return { score, triggers, warnings };
}
