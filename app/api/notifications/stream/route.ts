import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Store active connections
const connections = new Map<string, ReadableStreamDefaultController>();

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      connections.set(userId, controller);

      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': ping\n\n'));
        } catch (error) {
          clearInterval(keepAlive);
        }
      }, 30000);

      // Cleanup on close
      req.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        connections.delete(userId);
        try {
          controller.close();
        } catch (e) {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Helper to send notification to a user
export function sendNotification(userId: string, notification: any) {
  const controller = connections.get(userId);
  if (controller) {
    try {
      const data = `data: ${JSON.stringify(notification)}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));
    } catch (error) {
      console.error('Failed to send notification:', error);
      connections.delete(userId);
    }
  }
}
