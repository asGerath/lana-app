import { initialTasksState } from './initialState';
import { selectFilteredTasksByColumn } from './task.selectors';

describe('task.selectors', () => {
  const baseState = {
    app: { isReady: true },
    auth: {
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    },
    tasks: {
      ...initialTasksState,
      board: {
        ...initialTasksState.board,
        tasksById: {
          'task-1': {
            id: 'task-1',
            title: 'Comprar pan',
            description: 'Integral',
            status: 'pending' as const,
            favorite: false,
            createdBy: 'user-1',
            createdAt: 1,
            updatedAt: 1,
            version: 1,
          },
          'task-2': {
            id: 'task-2',
            title: 'Revisar PR',
            description: 'Urgente',
            status: 'in_progress' as const,
            favorite: true,
            createdBy: 'user-1',
            createdAt: 1,
            updatedAt: 1,
            version: 1,
          },
        },
        columns: {
          ...initialTasksState.board.columns,
          pending: {
            ...initialTasksState.board.columns.pending,
            taskIds: ['task-1', 'missing-task'],
          },
          in_progress: {
            ...initialTasksState.board.columns.in_progress,
            taskIds: ['task-2'],
          },
        },
      },
    },
  } as const;

  it('returns only existing tasks for a column', () => {
    const result = selectFilteredTasksByColumn(baseState as never, 'pending');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('task-1');
  });

  it('filters by search text in title and description', () => {
    const withSearch = {
      ...baseState,
      tasks: {
        ...baseState.tasks,
        search: 'inte',
      },
    };

    const result = selectFilteredTasksByColumn(withSearch as never, 'pending');

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Comprar pan');
  });

  it('filters by selected status', () => {
    const withStatus = {
      ...baseState,
      tasks: {
        ...baseState.tasks,
        selectedStatus: 'in_progress' as const,
      },
    };

    const pending = selectFilteredTasksByColumn(withStatus as never, 'pending');
    const inProgress = selectFilteredTasksByColumn(
      withStatus as never,
      'in_progress',
    );

    expect(pending).toHaveLength(0);
    expect(inProgress).toHaveLength(1);
    expect(inProgress[0].id).toBe('task-2');
  });

  it('filters by favorites across columns', () => {
    const withFavorites = {
      ...baseState,
      tasks: {
        ...baseState.tasks,
        selectedStatus: 'favorites' as const,
      },
    };

    const pending = selectFilteredTasksByColumn(withFavorites as never, 'pending');
    const inProgress = selectFilteredTasksByColumn(
      withFavorites as never,
      'in_progress',
    );

    expect(pending).toHaveLength(0);
    expect(inProgress).toHaveLength(1);
    expect(inProgress[0].id).toBe('task-2');
  });
});
