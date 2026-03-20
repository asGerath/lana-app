'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { clearSessionFromStorage } from '@/features/auth/auth-storage';
import { getBoardFromStorage, saveBoardToStorage } from '@/features/tasks/task-storage';
import Board from '@/components/board/Board';
import TaskForm from '@/components/board/TaskForm';
import { clearTasksState, setBoardState } from '@/store/slices/tasksSlice';
import { logout } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import TaskFilters from '@/components/board/TaskFilters';

const BoardPageWrapper = styled.main`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.xxl};
`;

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
`;

const UserInfo = styled.p`
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const LogoutButton = styled.button`
  border: none;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`;

export default function BoardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { board } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;

    const storedBoard = getBoardFromStorage(user.id);

    if (storedBoard) {
      dispatch(setBoardState(storedBoard));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) return;
    saveBoardToStorage(user.id, board);
  }, [board, user]);

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
      <Header>
        <div>
          <Title>Task Board</Title>
          <UserInfo>
            Sesión activa como: {user.name} ({user.email})
          </UserInfo>
        </div>

        <LogoutButton onClick={handleLogout}>Cerrar sesión</LogoutButton>
      </Header>

      <TaskForm />
      <TaskFilters />
      <Board />
    </BoardPageWrapper>
  );
}