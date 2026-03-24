import { render } from '@testing-library/react';

const mockUseRestoreSession = jest.fn();

jest.mock('@/features/auth/useRestoreSession', () => ({
  useRestoreSession: () => mockUseRestoreSession(),
}));

import SessionBootstrap from './SessionBootstrap';

describe('SessionBootstrap', () => {
  it('invokes the restore session hook and renders nothing', () => {
    const { container } = render(<SessionBootstrap />);

    expect(mockUseRestoreSession).toHaveBeenCalled();
    expect(container.firstChild).toBeNull();
  });
});
