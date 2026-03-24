import { NextRequest } from 'next/server';
import { sseBroker } from '@/lib/sse-broker';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const buildEventChunk = (event: string, payload: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')?.trim();

  if (!userId) {
    return Response.json(
      { error: 'userId es requerido para abrir el stream SSE.' },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (chunk: string) => {
        controller.enqueue(encoder.encode(chunk));
      };

      const { remove } = sseBroker.addClient(userId, send);
      const heartbeat = setInterval(() => {
        send(buildEventChunk('ping', { timestamp: Date.now() }));
      }, 25000);

      send(
        buildEventChunk('connected', {
          userId,
          timestamp: Date.now(),
          listeners: sseBroker.count(userId),
        }),
      );

      cleanup = () => {
        clearInterval(heartbeat);
        remove();
      };
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
