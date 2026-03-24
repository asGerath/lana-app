import { render } from '@testing-library/react';

const mockUseAppDispatch = jest.fn();
const mockRestoreUserSession = jest.fn();

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockUseAppDispatch(),
}));

jest.mock('./restore-session', () => ({
  restoreUserSession: (dispatch: unknown) => mockRestoreUserSession(dispatch),
}));

import { useRestoreSession } from './useRestoreSession';

function TestComponent() {
  useRestoreSession();
  return null;
}

describe('useRestoreSession', () => {
  it('restores the session on mount', () => {
    const dispatch = jest.fn();
    mockUseAppDispatch.mockReturnValue(dispatch);

    render(<TestComponent />);

    expect(mockRestoreUserSession).toHaveBeenCalledWith(dispatch);
  });
});
