const mockValidateDynamicKey = jest.fn();
const mockDelay = jest.fn();
const mockGetReqresHeaders = jest.fn(() => ({
  'Content-Type': 'application/json',
  'x-api-key': 'test-key',
}));

const importPostHandler = async (isConfigured = true) => {
  jest.resetModules();

  jest.doMock('next/server', () => ({
    NextRequest: class NextRequest {},
    NextResponse: {
      json: (body: unknown, init?: { status?: number }) => ({
        status: init?.status ?? 200,
        json: async () => body,
      }),
    },
  }));

  jest.doMock('@/features/auth/auth-delay', () => ({
    simulateNetworkDelay: mockDelay,
  }));

  jest.doMock('@/features/auth/validate-key', () => ({
    validateDynamicKey: mockValidateDynamicKey,
  }));

  jest.doMock('@/lib/reqres', () => ({
    REQRES_BASE_URL: 'https://reqres.in/api',
    getReqresHeaders: mockGetReqresHeaders,
    isReqresConfigured: isConfigured,
  }));

  const routeModule = await import('./route');
  return routeModule.POST;
};

const buildRequest = (body: Record<string, unknown>) =>
  ({
    json: async () => body,
  }) as never;

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('returns 500 when ReqRes key is not configured', async () => {
    const POST = await importPostHandler(false);

    const response = await POST(buildRequest({}) as never);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Configura REQRES_API_KEY');
  });

  it('returns 400 when required fields are missing', async () => {
    const POST = await importPostHandler(true);

    const response = await POST(
      buildRequest({ email: 'ejemplo@prestalana.com' }) as never,
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Faltan datos requeridos');
  });

  it('returns 401 when dynamic key is invalid', async () => {
    const POST = await importPostHandler(true);
    mockValidateDynamicKey.mockReturnValue(false);

    const response = await POST(
      buildRequest({
        email: 'ejemplo@prestalana.com',
        password: 'user99',
        key: 'bad',
        timestamp: '1',
        nonce: '1',
      }) as never,
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid dynamic key');
  });

  it('returns 401 when app credentials are invalid', async () => {
    const POST = await importPostHandler(true);
    mockValidateDynamicKey.mockReturnValue(true);

    const response = await POST(
      buildRequest({
        email: 'otro@correo.com',
        password: 'bad-pass',
        key: 'ok',
        timestamp: '1700000000000',
        nonce: 'nonce',
      }) as never,
    );
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('Credenciales inválidas');
  });

  it('returns upstream error when ReqRes login fails', async () => {
    const POST = await importPostHandler(true);
    mockValidateDynamicKey.mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'user not found' }),
    });

    const response = await POST(
      buildRequest({
        email: 'ejemplo@prestalana.com',
        password: 'user99',
        key: 'ok',
        timestamp: '1700000000000',
        nonce: 'nonce',
      }) as never,
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('user not found');
    expect(mockDelay).toHaveBeenCalled();
  });

  it('returns token when all validations pass and ReqRes succeeds', async () => {
    const POST = await importPostHandler(true);
    mockValidateDynamicKey.mockReturnValue(true);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ token: 'token-123' }),
    });

    const response = await POST(
      buildRequest({
        email: 'ejemplo@prestalana.com',
        password: 'user99',
        key: 'ok',
        timestamp: '1700000000000',
        nonce: 'nonce',
      }) as never,
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ token: 'token-123' });
    expect(mockGetReqresHeaders).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      'https://reqres.in/api/login',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
