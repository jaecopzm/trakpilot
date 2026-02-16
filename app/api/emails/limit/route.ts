import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkEmailLimit } from '@/lib/email-limits';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const limitCheck = await checkEmailLimit(userId);
    
    return NextResponse.json({
      remaining: limitCheck.remaining,
      limit: limitCheck.limit,
      isPremium: limitCheck.limit === -1
    });
  } catch (error) {
    console.error('Error checking limit:', error);
    return NextResponse.json(
      { error: 'Failed to check limit' },
      { status: 500 }
    );
  }
}
