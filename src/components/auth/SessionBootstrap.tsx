'use client';

import { useRestoreSession } from '@/features/auth/useRestoreSession';

export default function SessionBootstrap() {
  useRestoreSession();

  return null;
}