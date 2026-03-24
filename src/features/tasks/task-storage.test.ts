import { STORAGE_KEYS } from '@/lib/storage-keys';
import { initialTasksState } from './initialState';
import { taskCache } from './task-cache';
import {
  clearBoardFromStorage,
  getBoardFromStorage,
  saveBoardToStorage,
} from './task-storage';

describe('task-storage', () => {
  const userId = 'user-1';

  beforeEach(() => {
    localStorage.clear();
    taskCache.clear();
  });

  it('saves board into localStorage and cache', () => {
    saveBoardToStorage(userId, initialTasksState.board);

    expect(localStorage.getItem(STORAGE_KEYS.boardByUser(userId))).toBeTruthy();
    expect(taskCache.has(userId)).toBe(true);
  });

  it('returns board from cache when available', () => {
    taskCache.set(userId, initialTasksState.board);

    const board = getBoardFromStorage(userId);

    expect(board).toEqual(initialTasksState.board);
  });

  it('returns board from localStorage when cache is empty', () => {
    saveBoardToStorage(userId, initialTasksState.board);
    taskCache.clear(userId);

    const board = getBoardFromStorage(userId);

    expect(board).toEqual(initialTasksState.board);
  });

  it('clears board from localStorage and cache', () => {
    saveBoardToStorage(userId, initialTasksState.board);

    clearBoardFromStorage(userId);

    expect(localStorage.getItem(STORAGE_KEYS.boardByUser(userId))).toBeNull();
    expect(taskCache.has(userId)).toBe(false);
  });
});
