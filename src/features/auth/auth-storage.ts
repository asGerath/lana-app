import { STORAGE_KEYS } from '@/lib/storage-keys';
import { SessionData, User } from './types';
import { decryptValue, encryptValue } from './auth-crypto';

type PersistedSession = {
  user: User;
  session: SessionData;
};

export const saveSessionToStorage = (user: User, token: string) => {
  if (typeof window === 'undefined') return;

  const encryptedToken = encryptValue(token);

  const session: SessionData = {
    token,
    encryptedToken,
    expiresAt: Date.now() + 1000 * 60 * 60 * 8,
  };

  const payload: PersistedSession = {
    user,
    session,
  };

  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(payload));
  localStorage.setItem(STORAGE_KEYS.token, encryptedToken);

  return payload;
};

export const getSessionFromStorage = (): PersistedSession | null => {
  if (typeof window === 'undefined') return null;

  const rawSession = localStorage.getItem(STORAGE_KEYS.session);
  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession) as PersistedSession;

    if (parsed.session.expiresAt < Date.now()) {
      clearSessionFromStorage();
      return null;
    }

    const decryptedToken = decryptValue(parsed.session.encryptedToken);

    return {
      user: parsed.user,
      session: {
        ...parsed.session,
        token: decryptedToken,
      },
    };
  } catch {
    clearSessionFromStorage();
    return null;
  }
};

export const clearSessionFromStorage = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEYS.session);
  localStorage.removeItem(STORAGE_KEYS.token);
};