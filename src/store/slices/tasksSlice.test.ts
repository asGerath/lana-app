import { TaskNode } from '@/features/tasks/types';
import {
  clearTasksState,
  createTask,
  deleteTask,
  moveTask,
  setBoardState,
  setSearch,
  setSelectedStatus,
  setTasksError,
  setTasksLoading,
  tasksReducer,
  toggleFavorite,
  updateTask,
} from './tasksSlice';
import { initialTasksState } from '@/features/tasks/initialState';

const buildTask = (overrides?: Partial<TaskNode>): TaskNode => ({
  id: 'task-1',
  title: 'Tarea base',
  description: 'Descripcion',
  status: 'pending',
  favorite: false,
  createdBy: 'user-1',
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
  version: 1,
  ...overrides,
});

describe('tasksSlice reducer', () => {
  it('sets loading, error and filter state', () => {
    let nextState = tasksReducer(undefined, setTasksLoading(true));
    nextState = tasksReducer(nextState, setTasksError('boom'));
    nextState = tasksReducer(nextState, setSearch('lana'));
    nextState = tasksReducer(nextState, setSelectedStatus('completed'));

    expect(nextState.isLoading).toBe(true);
    expect(nextState.error).toBe('boom');
    expect(nextState.search).toBe('lana');
    expect(nextState.selectedStatus).toBe('completed');
  });

  it('replaces board state and clears loading and error', () => {
    const board = {
      ...initialTasksState.board,
      columns: {
        ...initialTasksState.board.columns,
        pending: {
          ...initialTasksState.board.columns.pending,
          taskIds: ['task-1'],
        },
      },
      tasksById: {
        'task-1': buildTask(),
      },
    };

    const previousState = {
      ...initialTasksState,
      isLoading: true,
      error: 'boom',
    };

    const nextState = tasksReducer(previousState, setBoardState(board));

    expect(nextState.board).toEqual(board);
    expect(nextState.isLoading).toBe(false);
    expect(nextState.error).toBeNull();
  });

  it('creates a task and appends it into target column', () => {
    const task = buildTask();

    const nextState = tasksReducer(undefined, createTask({ task }));

    expect(nextState.board.tasksById[task.id]).toEqual(task);
    expect(nextState.board.columns.pending.taskIds).toContain(task.id);
  });

  it('sets conflict error when expectedVersion does not match', () => {
    const task = buildTask();
    const withTask = tasksReducer(undefined, createTask({ task }));

    const nextState = tasksReducer(
      withTask,
      updateTask({
        id: task.id,
        expectedVersion: 2,
        changes: { title: 'Cambio no valido' },
      }),
    );

    expect(nextState.error).toBe(
      'Conflicto de edición: la tarea fue modificada antes de guardar.',
    );
    expect(nextState.board.tasksById[task.id].title).toBe('Tarea base');
  });

  it('updates a task, clears previous error and moves it to another column when status changes', () => {
    const now = 1_700_000_005_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const task = buildTask();
    const withTask = tasksReducer(undefined, createTask({ task }));
    const withError = tasksReducer(withTask, setTasksError('old error'));

    const nextState = tasksReducer(
      withError,
      updateTask({
        id: task.id,
        expectedVersion: 1,
        changes: {
          title: 'Titulo actualizado',
          status: 'completed',
        },
      }),
    );

    expect(nextState.board.tasksById[task.id].title).toBe('Titulo actualizado');
    expect(nextState.board.tasksById[task.id].status).toBe('completed');
    expect(nextState.board.columns.pending.taskIds).not.toContain(task.id);
    expect(nextState.board.columns.completed.taskIds).toContain(task.id);
    expect(nextState.board.tasksById[task.id].updatedAt).toBe(now);
    expect(nextState.board.tasksById[task.id].version).toBe(2);
    expect(nextState.error).toBeNull();

    jest.restoreAllMocks();
  });

  it('ignores update requests for unknown tasks', () => {
    const nextState = tasksReducer(
      undefined,
      updateTask({
        id: 'missing',
        changes: { title: 'No aplica' },
      }),
    );

    expect(nextState).toEqual(initialTasksState);
  });

  it('moves a task across columns and updates status and version', () => {
    const now = 1_700_000_010_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const task = buildTask();
    const withTask = tasksReducer(undefined, createTask({ task }));

    const nextState = tasksReducer(
      withTask,
      moveTask({
        taskId: task.id,
        sourceColumnId: 'pending',
        destinationColumnId: 'in_progress',
        sourceIndex: 0,
        destinationIndex: 0,
      }),
    );

    expect(nextState.board.columns.pending.taskIds).not.toContain(task.id);
    expect(nextState.board.columns.in_progress.taskIds).toContain(task.id);
    expect(nextState.board.tasksById[task.id].status).toBe('in_progress');
    expect(nextState.board.tasksById[task.id].version).toBe(2);
    expect(nextState.board.tasksById[task.id].updatedAt).toBe(now);

    jest.restoreAllMocks();
  });

  it('reorders a task inside the same column', () => {
    const firstTask = buildTask({ id: 'task-1' });
    const secondTask = buildTask({ id: 'task-2' });

    let state = tasksReducer(undefined, createTask({ task: firstTask }));
    state = tasksReducer(state, createTask({ task: secondTask }));

    const nextState = tasksReducer(
      state,
      moveTask({
        taskId: 'task-1',
        sourceColumnId: 'pending',
        destinationColumnId: 'pending',
        sourceIndex: 0,
        destinationIndex: 1,
      }),
    );

    expect(nextState.board.columns.pending.taskIds).toEqual(['task-2', 'task-1']);
  });

  it('deletes a task from board state', () => {
    const task = buildTask();
    const withTask = tasksReducer(undefined, createTask({ task }));

    const nextState = tasksReducer(withTask, deleteTask({ id: task.id }));

    expect(nextState.board.tasksById[task.id]).toBeUndefined();
    expect(nextState.board.columns.pending.taskIds).not.toContain(task.id);
  });

  it('ignores delete and favorite actions for unknown tasks', () => {
    const deletedState = tasksReducer(undefined, deleteTask({ id: 'missing' }));
    const favoriteState = tasksReducer(undefined, toggleFavorite({ id: 'missing' }));

    expect(deletedState).toEqual(initialTasksState);
    expect(favoriteState).toEqual(initialTasksState);
  });

  it('toggles favorite and increments version', () => {
    const now = 1_700_000_020_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const task = buildTask();
    const withTask = tasksReducer(undefined, createTask({ task }));

    const nextState = tasksReducer(withTask, toggleFavorite({ id: task.id }));

    expect(nextState.board.tasksById[task.id].favorite).toBe(true);
    expect(nextState.board.tasksById[task.id].version).toBe(2);
    expect(nextState.board.tasksById[task.id].updatedAt).toBe(now);

    jest.restoreAllMocks();
  });

  it('clears tasks state back to defaults', () => {
    const task = buildTask();

    let state = tasksReducer(undefined, createTask({ task }));
    state = tasksReducer(state, setTasksLoading(true));
    state = tasksReducer(state, setTasksError('boom'));
    state = tasksReducer(state, setSearch('query'));
    state = tasksReducer(state, setSelectedStatus('pending'));

    const nextState = tasksReducer(state, clearTasksState());

    expect(nextState).toEqual(initialTasksState);
  });
});
