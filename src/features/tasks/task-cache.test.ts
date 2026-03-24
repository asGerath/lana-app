import { initialTasksState } from './initialState';
import { taskCache } from './task-cache';

describe('task-cache', () => {
  const userId = 'user-1';

  beforeEach(() => {
    taskCache.clear();
  });

  it('stores and retrieves board by user id', () => {
    taskCache.set(userId, initialTasksState.board);

    expect(taskCache.has(userId)).toBe(true);
    expect(taskCache.get(userId)).toEqual(initialTasksState.board);
  });

  it('clears one user cache entry', () => {
    taskCache.set(userId, initialTasksState.board);

    taskCache.clear(userId);

    expect(taskCache.has(userId)).toBe(false);
  });
});
