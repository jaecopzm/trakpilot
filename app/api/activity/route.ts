import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const since = searchParams.get('since');

    try {
        const whereClause = since ? 'AND timestamp > ?' : '';
        const args = since ? [userId, userId, Number(since), Number(since)] : [userId, userId];

        const result = await db.execute({
            sql: `
                SELECT 
                    'open' as type, 
                    o.id, 
                    o.location, 
                    o.device_type, 
                    o.opened_at as timestamp, 
                    e.recipient, 
                    e.subject,
                    NULL as url,
                    o.is_proxy
                FROM opens o 
                JOIN emails e ON o.email_id = e.id 
                WHERE e.user_id = ? ${since ? 'AND o.opened_at > ?' : ''}

                UNION ALL

                SELECT 
                    'click' as type, 
                    lc.id, 
                    lc.location, 
                    NULL as device_type, 
                    lc.clicked_at as timestamp, 
                    e.recipient, 
                    e.subject,
                    l.original_url as url,
                    lc.is_proxy
                FROM link_clicks lc 
                JOIN links l ON lc.link_id = l.id 
                JOIN emails e ON l.email_id = e.id 
                WHERE e.user_id = ? ${since ? 'AND lc.clicked_at > ?' : ''}

                ORDER BY timestamp DESC 
                LIMIT 50
            `,
            args
        });
        return NextResponse.json({ activity: result.rows });
    } catch (error) {
        console.error('Error fetching activity:', error);
        return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
    }
}
