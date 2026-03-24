import { generateDynamicKey } from './dynamic-key';

type LoginParams = {
  email: string;
  password: string;
};

type LoginResponse = {
  token: string;
};

const mapLoginError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'No se pudo iniciar sesión. Inténtalo nuevamente.';
  }

  return error.message || 'No se pudo iniciar sesión con ReqRes en este momento.';
};

export const loginRequest = async ({
  email,
  password,
}: LoginParams): Promise<LoginResponse> => {
  const { key, timestamp, nonce } = generateDynamicKey();

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        key,
        timestamp,
        nonce,
      }),
    });

    const data = (await response.json()) as { error?: string; token?: string };

    if (!response.ok) {
      throw new Error(
        data.error || 'No se pudo iniciar sesión con ReqRes en este momento.',
      );
    }

    if (!data.token) {
      throw new Error('ReqRes no devolvió un token válido.');
    }

    return { token: data.token };
  } catch (error) {
    throw new Error(mapLoginError(error));
  }
};