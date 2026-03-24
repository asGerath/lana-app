'use client';

import { useEffect } from 'react';
import { TaskTree } from './types';
import { useAppDispatch } from '@/store/hooks';
import { setBoardState } from '@/store/slices/tasksSlice';

type BoardUpdatedPayload = {
  userId: string;
  sourceClientId?: string;
  board: TaskTree;
  updatedAt: number;
};

type UseTaskRealtimeSSEParams = {
  userId?: string;
  enabled: boolean;
  clientId: string;
  onRemoteBoardApplied?: () => void;
};

export const useTaskRealtimeSSE = ({
  userId,
  enabled,
  clientId,
  onRemoteBoardApplied,
}: UseTaskRealtimeSSEParams) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled || !userId) return;

    const streamUrl = `/api/tasks/stream?userId=${encodeURIComponent(userId)}`;
    const eventSource = new EventSource(streamUrl);

    const onBoardUpdated = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as BoardUpdatedPayload;

        if (!payload.board) return;
        if (payload.sourceClientId === clientId) return;

        onRemoteBoardApplied?.();
        dispatch(setBoardState(payload.board));
      } catch {}
    };

    eventSource.addEventListener('board-updated', onBoardUpdated as EventListener);

    return () => {
      eventSource.removeEventListener(
        'board-updated',
        onBoardUpdated as EventListener,
      );
      eventSource.close();
    };
  }, [clientId, dispatch, enabled, onRemoteBoardApplied, userId]);
};
