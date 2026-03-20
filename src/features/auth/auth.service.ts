import axios from 'axios';
import { isReqresConfigured, reqresClient } from '@/lib/reqres';
import { generateDynamicKey } from './dynamic-key';
import { validateDynamicKey } from './validate-key';
import { simulateNetworkDelay } from './auth-delay';

type LoginParams = {
  email: string;
  password: string;
};

const DEMO_CREDENTIALS = {
  email: 'user@prestalana.com',
  password: 'prestalana123',
};

const isAuthMockEnabled =
  process.env.NODE_ENV !== 'production' &&
  process.env.NEXT_PUBLIC_ENABLE_AUTH_MOCK === 'true';

const canUseMockLogin = ({ email, password }: LoginParams) => {
  return (
    isAuthMockEnabled &&
    email.trim().toLowerCase() === DEMO_CREDENTIALS.email &&
    password === DEMO_CREDENTIALS.password
  );
};

const buildMockLoginResponse = () => ({
  token: `mock-dev-token-${Date.now()}`,
});

const mapLoginError = (error: unknown): string => {
  if (!axios.isAxiosError(error)) {
    return 'No se pudo iniciar sesión. Inténtalo nuevamente.';
  }

  const status = error.response?.status;
  const apiError = error.response?.data?.error;

  if (status === 400) {
    return 'Credenciales inválidas. Verifica email y password.';
  }

  if (status === 401 || apiError === 'missing_api_key') {
    return 'No se pudo autenticar con el servicio. Falta configurar NEXT_PUBLIC_REQRES_API_KEY.';
  }

  if (status === 403 || apiError === 'invalid_api_key') {
    return 'No se pudo autenticar con el servicio. Verifica tu API key en .env.local.';
  }

  if (typeof apiError === 'string' && apiError.length > 0) {
    return apiError;
  }

  return 'No se pudo iniciar sesión con ReqRes en este momento.';
};

export const loginRequest = async ({
  email,
  password,
}: LoginParams) => {
  await simulateNetworkDelay();

  const { key, timestamp } = generateDynamicKey();

  const isValid = validateDynamicKey({ key, timestamp });

  if (!isValid) {
    throw new Error('Invalid dynamic key');
  }

  if (!isReqresConfigured) {
    if (canUseMockLogin({ email, password })) {
      return buildMockLoginResponse();
    }

    throw new Error(
      'Configura NEXT_PUBLIC_REQRES_API_KEY en .env.local. Si estás en desarrollo, también puedes activar NEXT_PUBLIC_ENABLE_AUTH_MOCK=true.',
    );
  }

  try {
    const response = await reqresClient.post('/login', {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    if (canUseMockLogin({ email, password })) {
      return buildMockLoginResponse();
    }

    throw new Error(mapLoginError(error));
  }
};