'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { restoreUserSession } from './restore-session';

export const useRestoreSession = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    restoreUserSession(dispatch);
  }, [dispatch]);
};