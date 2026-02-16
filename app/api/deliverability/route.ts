import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkDeliverability } from '@/lib/deliverability';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { subject, body, fromEmail, hasCustomDomain, hasSPF, hasDKIM, hasDMARC } = await req.json();

    const result = checkDeliverability(
      subject || '',
      body || '',
      fromEmail || '',
      hasCustomDomain || false,
      hasSPF || false,
      hasDKIM || false,
      hasDMARC || false
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Deliverability check error:', error);
    return NextResponse.json(
      { error: 'Failed to check deliverability' },
      { status: 500 }
    );
  }
}
