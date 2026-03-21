import { STORAGE_KEYS } from '@/lib/storage-keys';
import { TaskTree } from './types';
import { deserializeBoard, serializeBoard } from './task-serializer';
import { taskCache } from './task-cache';

export const saveBoardToStorage = (userId: string, board: TaskTree) => {
  if (typeof window === 'undefined') return;

  taskCache.set(userId, board);

  const serializedBoard = serializeBoard(board);
  localStorage.setItem(STORAGE_KEYS.boardByUser(userId), serializedBoard);
};

export const getBoardFromStorage = (userId: string): TaskTree | null => {
  if (typeof window === 'undefined') return null;

  const cachedBoard = taskCache.get(userId);
  if (cachedBoard) return cachedBoard;

  const rawBoard = localStorage.getItem(STORAGE_KEYS.boardByUser(userId));
  if (!rawBoard) return null;

  const parsedBoard = deserializeBoard(rawBoard);

  if (parsedBoard) {
    taskCache.set(userId, parsedBoard);
  }

  return parsedBoard;
};

export const clearBoardFromStorage = (userId: string) => {
  if (typeof window === 'undefined') return;

  taskCache.clear(userId);
  localStorage.removeItem(STORAGE_KEYS.boardByUser(userId));
};