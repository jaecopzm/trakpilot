import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Optional: Secure this in production. For now log warning or allow if CRON_SECRET not set
        if (process.env.CRON_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    const now = Date.now();

    try {
        // 1. Find active enrollments with a due step
        // We join with sequence_steps to get the step data
        const result = await db.execute({
            sql: `
            SELECT 
                e.id as enrollment_id,
                e.user_id,
                e.recipient_email,
                e.current_step,
                e.sequence_id,
                s.subject,
                s.body,
                s.id as step_id
            FROM sequence_enrollments e
            JOIN sequence_steps s ON e.sequence_id = s.sequence_id AND s.step_order = (e.current_step + 1)
            WHERE e.status = 'active' 
              AND e.next_step_due <= ?
            LIMIT 50 -- Batch size to avoid timeouts
            `,
            args: [now]
        });

        const dueItems = result.rows;
        let processedCount = 0;
        let errorCount = 0;

        for (const item of dueItems) {
            try {
                // Send the email
                await sendEmail({
                    userId: item.user_id as string,
                    to: item.recipient_email as string,
                    subject: item.subject as string,
                    body: item.body as string,
                    source: 'sequence'
                });

                // Calculate next step
                const nextStepOrder = (item.current_step as number) + 1;

                // Check if there is a subsequent step
                const nextStepResult = await db.execute({
                    sql: `SELECT day_delay FROM sequence_steps WHERE sequence_id = ? AND step_order = ?`,
                    args: [item.sequence_id, nextStepOrder + 1]
                });

                let nextDue = null;
                let newStatus = 'active';

                if (nextStepResult.rows.length > 0) {
                    // There is another step
                    const delayDays = nextStepResult.rows[0].day_delay as number;
                    nextDue = now + (delayDays * 24 * 60 * 60 * 1000);
                } else {
                    // No more steps
                    newStatus = 'completed';
                }

                // Update enrollment
                await db.execute({
                    sql: `UPDATE sequence_enrollments 
                          SET current_step = ?, next_step_due = ?, status = ?, updated_at = ?
                          WHERE id = ?`,
                    args: [nextStepOrder, nextDue, newStatus, now, item.enrollment_id]
                });

                processedCount++;
            } catch (err) {
                console.error(`Failed to process enrollment ${item.enrollment_id}:`, err);
                errorCount++;
            }
        }

        return NextResponse.json({
            success: true,
            processed: processedCount,
            errors: errorCount,
            total_found: dueItems.length
        });

    } catch (error) {
        console.error('Sequence Cron Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
