'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { clearSessionFromStorage } from '@/features/auth/auth-storage';
import { clearTasksState } from '@/store/slices/tasksSlice';
import { logout } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const BoardWrapper = styled.main`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.xxl};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 2rem;
`;

const UserInfo = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
`;

const LogoutButton = styled.button`
  border: none;
  padding: 10px 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.danger};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`;

const PlaceholderCard = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`;

export default function BoardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    clearSessionFromStorage();
    dispatch(logout());
    dispatch(clearTasksState());
    router.replace('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <BoardWrapper>
      <Header>
        <div>
          <Title>Task Board</Title>
          <UserInfo>
            Sesión activa como: {user?.name} ({user?.email})
          </UserInfo>
        </div>

        <LogoutButton onClick={handleLogout}>Cerrar sesión</LogoutButton>
      </Header>

      <PlaceholderCard>
        <p>Login funcionando. El tablero tipo Trello va en el siguiente bloque.</p>
      </PlaceholderCard>
    </BoardWrapper>
  );
}