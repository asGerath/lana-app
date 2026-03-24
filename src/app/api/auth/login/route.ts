import { NextRequest, NextResponse } from 'next/server';
import { simulateNetworkDelay } from '@/features/auth/auth-delay';
import { validateDynamicKey } from '@/features/auth/validate-key';
import { REQRES_BASE_URL, getReqresHeaders, isReqresConfigured } from '@/lib/reqres';

type LoginRequestBody = {
  email?: string;
  password?: string;
  key?: string;
  timestamp?: string;
  nonce?: string;
};

export async function POST(request: NextRequest) {
  if (!isReqresConfigured) {
    return NextResponse.json(
      {
        error: 'Configura REQRES_API_KEY en .env.local para habilitar el login.',
      },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as LoginRequestBody;
    const { email, password, key, timestamp, nonce } = body;

    if (!email || !password || !key || !timestamp || !nonce) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos para iniciar sesión.' },
        { status: 400 },
      );
    }

    const isValidDynamicKey = validateDynamicKey({
      key,
      timestamp,
      nonce,
    });

    if (!isValidDynamicKey) {
      return NextResponse.json(
        { error: 'Invalid dynamic key' },
        { status: 401 },
      );
    }

    await simulateNetworkDelay();

    const response = await fetch(`${REQRES_BASE_URL}/login`, {
      method: 'POST',
      headers: getReqresHeaders(),
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    const data = (await response.json()) as { error?: string; token?: string };

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data.error || 'No se pudo iniciar sesión con ReqRes en este momento.',
        },
        { status: response.status },
      );
    }

    return NextResponse.json({ token: data.token }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'No se pudo procesar el inicio de sesión.' },
      { status: 500 },
    );
  }
}