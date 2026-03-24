import { render } from '@testing-library/react';
import { useTaskRealtimeSSE } from './useTaskRealtimeSSE';
import { setBoardState } from '@/store/slices/tasksSlice';

const mockDispatch = jest.fn();

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

type Listener = (event: MessageEvent<string>) => void;

class MockEventSource {
  static instances: MockEventSource[] = [];

  public listeners = new Map<string, Set<Listener>>();
  public close = jest.fn();
  public addEventListener = jest.fn((type: string, callback: Listener) => {
    const callbacks = this.listeners.get(type) ?? new Set<Listener>();
    callbacks.add(callback);
    this.listeners.set(type, callbacks);
  });
  public removeEventListener = jest.fn((type: string, callback: Listener) => {
    this.listeners.get(type)?.delete(callback);
  });

  constructor(public url: string) {
    MockEventSource.instances.push(this);
  }

  emit(type: string, data: string) {
    this.listeners.get(type)?.forEach((callback) => {
      callback({ data } as MessageEvent<string>);
    });
  }
}

function TestComponent(props: {
  userId?: string;
  enabled: boolean;
  clientId: string;
  onRemoteBoardApplied?: () => void;
}) {
  useTaskRealtimeSSE(props);
  return null;
}

describe('useTaskRealtimeSSE', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'EventSource', {
      writable: true,
      value: MockEventSource,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    MockEventSource.instances = [];
  });

  it('does not open a stream when the hook is disabled', () => {
    render(<TestComponent enabled={false} userId="user-1" clientId="client-1" />);

    expect(MockEventSource.instances).toHaveLength(0);
  });

  it('applies remote boards coming from another client', () => {
    const onRemoteBoardApplied = jest.fn();
    const board = {
      tasksById: {},
      columns: {
        pending: { id: 'pending', title: 'Por hacer', taskIds: [] },
        in_progress: { id: 'in_progress', title: 'En progreso', taskIds: [] },
        completed: { id: 'completed', title: 'Completado', taskIds: [] },
      },
      columnOrder: ['pending', 'in_progress', 'completed'],
    };

    render(
      <TestComponent
        enabled
        userId="user-1"
        clientId="client-1"
        onRemoteBoardApplied={onRemoteBoardApplied}
      />,
    );

    expect(MockEventSource.instances[0].url).toBe('/api/tasks/stream?userId=user-1');

    MockEventSource.instances[0].emit(
      'board-updated',
      JSON.stringify({
        userId: 'user-1',
        sourceClientId: 'client-2',
        board,
        updatedAt: Date.now(),
      }),
    );

    expect(onRemoteBoardApplied).toHaveBeenCalled();
    expect(mockDispatch).toHaveBeenCalledWith(setBoardState(board));
  });

  it('ignores events from the same client and invalid payloads, then cleans up on unmount', () => {
    const board = {
      tasksById: {},
      columns: {
        pending: { id: 'pending', title: 'Por hacer', taskIds: [] },
        in_progress: { id: 'in_progress', title: 'En progreso', taskIds: [] },
        completed: { id: 'completed', title: 'Completado', taskIds: [] },
      },
      columnOrder: ['pending', 'in_progress', 'completed'],
    };

    const { unmount } = render(
      <TestComponent enabled userId="user-1" clientId="client-1" />,
    );

    const source = MockEventSource.instances[0];

    source.emit(
      'board-updated',
      JSON.stringify({
        userId: 'user-1',
        sourceClientId: 'client-1',
        board,
        updatedAt: Date.now(),
      }),
    );
    source.emit('board-updated', '{invalid json');

    expect(mockDispatch).not.toHaveBeenCalled();

    unmount();

    expect(source.removeEventListener).toHaveBeenCalled();
    expect(source.close).toHaveBeenCalled();
  });
});