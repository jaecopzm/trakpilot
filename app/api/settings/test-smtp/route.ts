import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { host, port, user, pass, fromEmail } = body;

        if (!host || !port || !user || !pass || !fromEmail) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: host as string,
            port: Number(port),
            secure: Number(port) === 465,
            auth: {
                user: user as string,
                pass: pass as string,
            },
        });

        // Verify connection configuration
        await transporter.verify();

        // Send a test email
        await transporter.sendMail({
            from: fromEmail,
            to: fromEmail, // Send to self
            subject: 'MailTrackr - SMTP Connection Test',
            text: 'Your SMTP settings are correctly configured. Happy tracking!',
            html: '<b>Your SMTP settings are correctly configured.</b><br/>Happy tracking!',
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('SMTP Test Error:', error);
        return NextResponse.json({
            error: (error as Error).message || 'Failed to connect to SMTP server'
        }, { status: 500 });
    }
}
