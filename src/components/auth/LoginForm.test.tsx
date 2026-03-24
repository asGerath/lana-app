import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import LoginForm from './LoginForm';
import { theme } from '@/styles/theme';
import {
  loginSuccess,
  setAuthError,
  setAuthLoading,
} from '@/store/slices/authSlice';

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockDispatch = jest.fn();
const mockLoginRequest = jest.fn();
const mockSaveSessionToStorage = jest.fn();

let mockAuthState = {
  isLoading: false,
  error: null as string | null,
  isAuthenticated: false,
};

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    <img {...props} alt={props.alt} />
  ),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock('@/features/auth/auth.service', () => ({
  loginRequest: (payload: unknown) => mockLoginRequest(payload),
}));

jest.mock('@/features/auth/auth-storage', () => ({
  saveSessionToStorage: (...args: unknown[]) => mockSaveSessionToStorage(...args),
}));

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: { auth: typeof mockAuthState }) => unknown) =>
    selector({ auth: mockAuthState }),
}));

const renderLoginForm = () =>
  render(
    <ThemeProvider theme={theme}>
      <LoginForm />
    </ThemeProvider>,
  );

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = {
      isLoading: false,
      error: null,
      isAuthenticated: false,
    };
  });

  it('renders demo credentials and social actions', () => {
    renderLoginForm();

    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    expect(screen.getByText('Inicia sesión con Google')).toBeInTheDocument();
    expect(screen.getByText('Inicia sesión con Facebook')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ejemplo@prestalana.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('user99')).toBeInTheDocument();
  });

  it('validates empty credentials before requesting login', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.clear(screen.getByPlaceholderText('tu@email.com'));
    await user.clear(screen.getByPlaceholderText('••••••••'));
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(mockDispatch).toHaveBeenCalledWith(
      setAuthError('Email y password son obligatorios.'),
    );
    expect(mockLoginRequest).not.toHaveBeenCalled();
  });

  it('submits successfully, persists session and redirects to board', async () => {
    const user = userEvent.setup();
    const persistedSession = {
      user: {
        id: 'reqres-user-1',
        email: 'ejemplo@prestalana.com',
        name: 'Usuario Demo',
      },
      session: {
        token: 'token-123',
        expiresAt: 1_700_000_000_000,
      },
    };

    mockLoginRequest.mockResolvedValue({ token: 'token-123' });
    mockSaveSessionToStorage.mockReturnValue(persistedSession);

    renderLoginForm();

    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(mockLoginRequest).toHaveBeenCalledWith({
        email: 'ejemplo@prestalana.com',
        password: 'user99',
      });
    });

    expect(mockDispatch).toHaveBeenCalledWith(setAuthLoading(true));
    expect(mockDispatch).toHaveBeenCalledWith(setAuthError(null));
    expect(mockSaveSessionToStorage).toHaveBeenCalledWith(
      {
        id: 'reqres-user-1',
        email: 'ejemplo@prestalana.com',
        name: 'Usuario Demo',
      },
      'token-123',
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      loginSuccess({
        user: persistedSession.user,
        session: persistedSession.session,
      }),
    );
    expect(mockPush).toHaveBeenCalledWith('/board');
  });

  it('shows loading label when auth state is loading', () => {
    mockAuthState = {
      isLoading: true,
      error: null,
      isAuthenticated: false,
    };

    renderLoginForm();

    expect(screen.getByRole('button', { name: 'Ingresando...' })).toBeDisabled();
  });

  it('renders auth error from store', () => {
    mockAuthState = {
      isLoading: false,
      error: 'Credenciales inválidas',
      isAuthenticated: false,
    };

    renderLoginForm();

    expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
  });

  it('dispatches error state when login request fails', async () => {
    const user = userEvent.setup();
    mockLoginRequest.mockRejectedValue(new Error('ReqRes unavailable'));

    renderLoginForm();

    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        setAuthError('ReqRes unavailable'),
      );
    });

    expect(mockDispatch).toHaveBeenCalledWith(setAuthLoading(false));
  });

  it('dispatches error state when session persistence fails', async () => {
    const user = userEvent.setup();
    mockLoginRequest.mockResolvedValue({ token: 'token-123' });
    mockSaveSessionToStorage.mockReturnValue(null);

    renderLoginForm();

    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        setAuthError('No se pudo guardar la sesión.'),
      );
    });

    expect(mockDispatch).toHaveBeenCalledWith(setAuthLoading(false));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects authenticated users to the board', () => {
    mockAuthState = {
      isLoading: false,
      error: null,
      isAuthenticated: true,
    };

    renderLoginForm();

    expect(mockReplace).toHaveBeenCalledWith('/board');
  });
});
