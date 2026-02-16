import { NextRequest, NextResponse } from 'next/server';
import { checkSpamScore } from '@/lib/spam-checker';

export async function POST(req: NextRequest) {
  try {
    const { subject, body } = await req.json();

    if (!subject || !body) {
      return NextResponse.json(
        { error: 'Subject and body required' },
        { status: 400 }
      );
    }

    const result = checkSpamScore(subject, body);

    return NextResponse.json({
      score: result.score,
      triggers: result.triggers,
      warnings: result.warnings,
      recommendation: result.score > 10 
        ? 'High spam risk - revise content' 
        : result.score > 5 
        ? 'Moderate spam risk - consider revisions' 
        : 'Low spam risk'
    });
  } catch (error) {
    console.error('Spam check error:', error);
    return NextResponse.json(
      { error: 'Failed to check spam score' },
      { status: 500 }
    );
  }
}
