import { reqresClient } from '@/lib/reqres';
import { generateDynamicKey } from './dynamic-key';
import { validateDynamicKey } from './validate-key';
import { simulateNetworkDelay } from './auth-delay';

type LoginParams = {
  email: string;
  password: string;
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

  const response = await reqresClient.post('/login', {
    email,
    password,
  });

  return response.data;
};