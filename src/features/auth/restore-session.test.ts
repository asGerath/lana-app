const mockGetSessionFromStorage = jest.fn();
const mockRestoreSession = jest.fn((session) => ({
  type: 'auth/restoreSession',
  payload: session,
}));

jest.mock('./auth-storage', () => ({
  getSessionFromStorage: () => mockGetSessionFromStorage(),
}));

jest.mock('@/store/slices/authSlice', () => ({
  restoreSession: (session: unknown) => mockRestoreSession(session),
}));

import { restoreUserSession } from './restore-session';

describe('restoreUserSession', () => {
  it('loads the session from storage and dispatches restoreSession', () => {
    const session = { token: 'abc', user: { id: 1 } };
    const dispatch = jest.fn();

    mockGetSessionFromStorage.mockReturnValue(session);

    restoreUserSession(dispatch as never);

    expect(mockRestoreSession).toHaveBeenCalledWith(session);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'auth/restoreSession',
      payload: session,
    });
  });
});
