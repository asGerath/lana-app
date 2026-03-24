export {};

const importPostHandler = async () => {
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

  const routeModule = await import('./route');
  return routeModule.POST;
};

const buildRequest = (body: Record<string, unknown>) =>
  ({
    json: async () => body,
  }) as never;

describe('POST /api/tasks/validate-title', () => {
  it('returns 400 when title is missing', async () => {
    const POST = await importPostHandler();

    const response = await POST(buildRequest({}) as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('title es requerido');
  });

  it('returns 400 when title has no special characters', async () => {
    const POST = await importPostHandler();

    const response = await POST(
      buildRequest({ title: 'Tarea sin caracteres especiales' }) as never,
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('caracter especial');
  });

  it('returns 200 when title is valid', async () => {
    const POST = await importPostHandler();

    const response = await POST(
      buildRequest({ title: 'Lanzar version #1' }) as never,
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
  });

  it('returns 500 when request parsing fails', async () => {
    const POST = await importPostHandler();

    const response = await POST(
      {
        json: async () => {
          throw new Error('bad request');
        },
      } as never,
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('No se pudo validar');
  });
});
