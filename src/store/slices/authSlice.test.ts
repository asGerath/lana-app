import {
  authReducer,
  loginSuccess,
  logout,
  restoreSession,
  setAuthError,
  setAuthLoading,
} from './authSlice';

describe('authSlice reducer', () => {
  const user = {
    id: 'user-1',
    email: 'ejemplo@prestalana.com',
    name: 'Usuario Demo',
  };

  const session = {
    token: 'token-123',
    encryptedToken: 'enc-token-123',
    expiresAt: 1_800_000_000_000,
  };

  it('sets loading state', () => {
    const nextState = authReducer(undefined, setAuthLoading(true));
    expect(nextState.isLoading).toBe(true);
  });

  it('sets auth error', () => {
    const nextState = authReducer(undefined, setAuthError('Error login'));
    expect(nextState.error).toBe('Error login');
  });

  it('handles login success', () => {
    const nextState = authReducer(undefined, loginSuccess({ user, session }));

    expect(nextState.user).toEqual(user);
    expect(nextState.session).toEqual(session);
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.error).toBeNull();
  });

  it('handles logout', () => {
    const loggedState = authReducer(undefined, loginSuccess({ user, session }));
    const nextState = authReducer(loggedState, logout());

    expect(nextState.user).toBeNull();
    expect(nextState.session).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
  });

  it('restores existing session', () => {
    const nextState = authReducer(undefined, restoreSession({ user, session }));

    expect(nextState.user).toEqual(user);
    expect(nextState.session).toEqual(session);
    expect(nextState.isAuthenticated).toBe(true);
  });

  it('clears state when restoring null session', () => {
    const loggedState = authReducer(undefined, loginSuccess({ user, session }));
    const nextState = authReducer(loggedState, restoreSession(null));

    expect(nextState.user).toBeNull();
    expect(nextState.session).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
  });
});
