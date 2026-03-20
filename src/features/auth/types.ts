export type User = {
  id: string;
  email: string;
  name: string;
};

export type SessionData = {
  token: string;
  encryptedToken: string;
  expiresAt: number;
};

export type AuthState = {
  user: User | null;
  session: SessionData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

// define los tipos de acciones para la autenticación