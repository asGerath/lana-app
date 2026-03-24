import { loginRequest } from './auth.service';

jest.mock('./dynamic-key', () => ({
  generateDynamicKey: () => ({
    key: 'test-key',
    timestamp: '1700000000000',
    nonce: 'nonce-123',
  }),
}));

describe('auth.service loginRequest', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns token when API route responds ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'token-123' }),
    } as Response);

    await expect(
      loginRequest({ email: 'ejemplo@prestalana.com', password: 'user99' }),
    ).resolves.toEqual({ token: 'token-123' });
  });

  it('throws API error message when route responds with failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Credenciales inválidas.' }),
    } as Response);

    await expect(
      loginRequest({ email: 'bad@email.com', password: 'bad' }),
    ).rejects.toThrow('Credenciales inválidas.');
  });

  it('throws when token is missing in successful response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    await expect(
      loginRequest({ email: 'ejemplo@prestalana.com', password: 'user99' }),
    ).rejects.toThrow('ReqRes no devolvió un token válido.');
  });
});
