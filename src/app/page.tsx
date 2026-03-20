'use client';

import { useEffect } from 'react';
import { saveSessionToStorage, getSessionFromStorage } from '@/features/auth/auth-storage';
import { saveBoardToStorage, getBoardFromStorage } from '@/features/tasks/task-storage';
import { initialTasksState } from '@/features/tasks/initialState';

export default function HomePage() {
  useEffect(() => {
    const user = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
    };

    saveSessionToStorage(user, 'fake-token-123');

    const session = getSessionFromStorage();
    console.log('session', session);

    saveBoardToStorage(user.id, initialTasksState.board);

    const board = getBoardFromStorage(user.id);
    console.log('board', board);
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Task Board App</h1>
      <p>Persistencia base lista.</p>
    </main>
  );
}