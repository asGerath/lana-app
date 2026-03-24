export {};

import { TextDecoder, TextEncoder } from 'node:util';
import { ReadableStream } from 'node:stream/web';

class MockResponse {
  body: ReadableStream<Uint8Array> | null;
  status: number;
  headers: Headers;
  private jsonBody: unknown;

  constructor(body: ReadableStream<Uint8Array> | null, init?: { status?: number; headers?: Record<string, string> }, jsonBody?: unknown) {
    this.body = body;
    this.status = init?.status ?? 200;
    this.headers = new Headers(init?.headers ?? {});
    this.jsonBody = jsonBody;
  }

  static json(body: unknown, init?: { status?: number; headers?: Record<string, string> }) {
    return new MockResponse(null, init, body);
  }

  async json() {
    return this.jsonBody;
  }
}

const mockRemove = jest.fn();
const mockAddClient = jest.fn(() => ({
  id: 'client-1',
  remove: mockRemove,
}));
const mockCount = jest.fn(() => 1);

const importGetHandler = async () => {
  jest.resetModules();

  jest.doMock('@/lib/sse-broker', () => ({
    sseBroker: {
      addClient: mockAddClient,
      count: mockCount,
    },
  }));

  const routeModule = await import('./route');
  return routeModule.GET;
};

const buildRequest = (userId?: string) =>
  ({
    nextUrl: {
      searchParams: new URLSearchParams(userId ? `userId=${userId}` : ''),
    },
  }) as never;

describe('GET /api/tasks/stream', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    Object.defineProperty(globalThis, 'TextEncoder', {
      writable: true,
      value: TextEncoder,
    });
    Object.defineProperty(globalThis, 'TextDecoder', {
      writable: true,
      value: TextDecoder,
    });
    Object.defineProperty(globalThis, 'ReadableStream', {
      writable: true,
      value: ReadableStream,
    });
    Object.defineProperty(globalThis, 'Response', {
      writable: true,
      value: MockResponse,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('returns 400 when userId is missing', async () => {
    const GET = await importGetHandler();

    const response = await GET(buildRequest());
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('userId es requerido');
  });

  it('opens an SSE stream, sends the connected event and cleans up on cancel', async () => {
    const GET = await importGetHandler();
    const response = await GET(buildRequest('user-1'));

    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache, no-transform');
    expect(mockAddClient).toHaveBeenCalledWith('user-1', expect.any(Function));

    const reader = response.body?.getReader();
    const firstChunk = await reader?.read();
    const firstText = new TextDecoder().decode(firstChunk?.value);

    expect(firstText).toContain('event: connected');
    expect(firstText).toContain('"userId":"user-1"');

    jest.advanceTimersByTime(25000);

    const pingChunk = await reader?.read();
    const pingText = new TextDecoder().decode(pingChunk?.value);

    expect(pingText).toContain('event: ping');

    await reader?.cancel();

    expect(mockRemove).toHaveBeenCalled();
  });
});