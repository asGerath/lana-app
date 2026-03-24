import { NextRequest, NextResponse } from 'next/server';
import { TaskTree } from '@/features/tasks/types';
import { sseBroker } from '@/lib/sse-broker';

type RealtimeUpdateBody = {
  userId?: string;
  sourceClientId?: string;
  board?: TaskTree;
};

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RealtimeUpdateBody;
    const { userId, board, sourceClientId } = body;

    if (!userId || !board) {
      return NextResponse.json(
        { error: 'userId y board son requeridos.' },
        { status: 400 },
      );
    }

    sseBroker.publishToUser(userId, 'board-updated', {
      userId,
      board,
      sourceClientId,
      updatedAt: Date.now(),
    });

    return NextResponse.json(
      {
        ok: true,
        listeners: sseBroker.count(userId),
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: 'No se pudo publicar el evento realtime.' },
      { status: 500 },
    );
  }
}
