'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { clearSessionFromStorage } from '@/features/auth/auth-storage';
import { getBoardFromStorage, saveBoardToStorage } from '@/features/tasks/task-storage';
import Image from 'next/image';
import Board from '@/components/board/Board';
import BoardNav from '@/components/nav/BoardNav';
import { clearTasksState, setBoardState } from '@/store/slices/tasksSlice';
import { logout } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { publishBoardUpdate } from '@/features/tasks/task-realtime.api';
import { useTaskRealtimeSSE } from '@/features/tasks/useTaskRealtimeSSE';

const BoardPageWrapper = styled.main`
  position: relative;
  z-index: 10;
  min-height: calc(100vh - 64px);
  background-color: ${({ theme }) => theme.colors.bgcian};
`;

const NavLayer = styled.header`
  position: sticky;
  top: 0;
  z-index: 40;
  background: #f3f4f6;
`;

const ContentLayer = styled.section`
  padding: 0 16px 24px;
  display: grid;
  gap: 12px;
`;

const FigureShape = styled.div`
  width: 100%;
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  pointer-events: none;
  user-select: none;

  z-index: -1;
`;

export default function BoardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { board } = useAppSelector((state) => state.tasks);
  const skipNextRealtimePublishRef = useRef(false);
  const realtimeClientId = useId();

  const handleRemoteBoardApplied = useCallback(() => {
    skipNextRealtimePublishRef.current = true;
  }, []);

  useTaskRealtimeSSE({
    userId: user?.id,
    enabled: Boolean(isAuthenticated && user),
    clientId: realtimeClientId,
    onRemoteBoardApplied: handleRemoteBoardApplied,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;

    const storedBoard = getBoardFromStorage(user.id);

    if (storedBoard) {
      skipNextRealtimePublishRef.current = true;
      dispatch(setBoardState(storedBoard));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) return;

    saveBoardToStorage(user.id, board);

    if (skipNextRealtimePublishRef.current) {
      skipNextRealtimePublishRef.current = false;
      return;
    }

    void publishBoardUpdate({
      userId: user.id,
      board,
      sourceClientId: realtimeClientId,
    });
  }, [board, realtimeClientId, user]);

  const handleLogout = () => {
    clearSessionFromStorage();
    dispatch(logout());
    dispatch(clearTasksState());
    router.replace('/login');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <BoardPageWrapper>
      <NavLayer>
        <BoardNav userName={user.name} onLogout={handleLogout} />
      </NavLayer>

      <ContentLayer>
        <Board />
      </ContentLayer>

      <FigureShape>
        <Image
          src="/rallas_bajas.webp"
          alt="Incados"
          width={220}
          height={160}
          priority={false}
          style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
        />
      </FigureShape>
    </BoardPageWrapper>
  );
}