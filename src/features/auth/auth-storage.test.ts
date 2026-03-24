import { STORAGE_KEYS } from '@/lib/storage-keys';
import {
  clearSessionFromStorage,
  getSessionFromStorage,
  saveSessionToStorage,
} from './auth-storage';

describe('auth-storage', () => {
  const user = {
    id: 'user-1',
    email: 'ejemplo@prestalana.com',
    name: 'Usuario Demo',
  };

  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('saves encrypted session payload in localStorage', () => {
    const now = 1_700_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const persisted = saveSessionToStorage(user, 'plain-token');

    expect(persisted?.session.token).toBe('plain-token');
    expect(persisted?.session.encryptedToken).not.toBe('plain-token');
    expect(localStorage.getItem(STORAGE_KEYS.session)).toBeTruthy();
    expect(localStorage.getItem(STORAGE_KEYS.token)).toBeTruthy();
  });

  it('restores and decrypts token from localStorage', () => {
    saveSessionToStorage(user, 'plain-token');

    const restored = getSessionFromStorage();

    expect(restored?.user).toEqual(user);
    expect(restored?.session.token).toBe('plain-token');
  });

  it('returns null and clears storage when session is expired', () => {
    const now = 1_700_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);
    saveSessionToStorage(user, 'plain-token');

    jest.spyOn(Date, 'now').mockReturnValue(now + 1000 * 60 * 60 * 9);

    expect(getSessionFromStorage()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.session)).toBeNull();
  });

  it('returns null when there is no persisted session', () => {
    expect(getSessionFromStorage()).toBeNull();
  });

  it('returns null and clears storage when payload is invalid JSON', () => {
    localStorage.setItem(STORAGE_KEYS.session, '{broken-json');
    localStorage.setItem(STORAGE_KEYS.token, 'token');

    expect(getSessionFromStorage()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.session)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.token)).toBeNull();
  });

  it('clears storage keys explicitly', () => {
    saveSessionToStorage(user, 'plain-token');

    clearSessionFromStorage();

    expect(localStorage.getItem(STORAGE_KEYS.session)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.token)).toBeNull();
  });
});

