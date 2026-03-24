export {};

const mockPublishToUser = jest.fn();
const mockCount = jest.fn();

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

  jest.doMock('@/lib/sse-broker', () => ({
    sseBroker: {
      publishToUser: (...args: unknown[]) => mockPublishToUser(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  }));

  const routeModule = await import('./route');
  return routeModule.POST;
};

const board = {
  tasksById: {},
  columns: {
    pending: { id: 'pending', title: 'Por hacer', taskIds: [] },
    in_progress: { id: 'in_progress', title: 'En progreso', taskIds: [] },
    completed: { id: 'completed', title: 'Completado', taskIds: [] },
  },
  columnOrder: ['pending', 'in_progress', 'completed'],
};

const buildRequest = (body: Record<string, unknown>) =>
  ({
    json: async () => body,
  }) as never;

describe('POST /api/tasks/realtime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCount.mockReturnValue(2);
  });

  it('returns 400 when required fields are missing', async () => {
    const POST = await importPostHandler();

    const response = await POST(buildRequest({ userId: 'user-1' }) as never);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('userId y board son requeridos');
  });

  it('publishes the update and returns the listener count', async () => {
    const POST = await importPostHandler();

    const response = await POST(
      buildRequest({
        userId: 'user-1',
        board,
        sourceClientId: 'client-1',
      }) as never,
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockPublishToUser).toHaveBeenCalledWith(
      'user-1',
      'board-updated',
      expect.objectContaining({
        userId: 'user-1',
        board,
        sourceClientId: 'client-1',
        updatedAt: expect.any(Number),
      }),
    );
    expect(data).toEqual({ ok: true, listeners: 2 });
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
    expect(data.error).toContain('No se pudo publicar');
  });
});