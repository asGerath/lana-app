import { publishBoardUpdate } from './task-realtime.api';
import { TaskTree } from './types';

const createBoard = (): TaskTree => ({
  tasksById: {},
  columns: {
    pending: { id: 'pending', title: 'Por hacer', taskIds: [] },
    in_progress: { id: 'in_progress', title: 'En progreso', taskIds: [] },
    completed: { id: 'completed', title: 'Completado', taskIds: [] },
  },
  columnOrder: ['pending', 'in_progress', 'completed'],
});

describe('publishBoardUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('posts board updates to the realtime endpoint', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

    const board = createBoard();

    await publishBoardUpdate({
      userId: 'user-1',
      board,
      sourceClientId: 'client-1',
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/tasks/realtime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'user-1',
        board,
        sourceClientId: 'client-1',
      }),
    });
  });

  it('swallows realtime transport failures to preserve local UX', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network'));

    await expect(
      publishBoardUpdate({
        userId: 'user-1',
        board: createBoard(),
        sourceClientId: 'client-1',
      }),
    ).resolves.toBeUndefined();
  });
});