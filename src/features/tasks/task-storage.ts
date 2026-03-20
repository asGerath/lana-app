import { STORAGE_KEYS } from '@/lib/storage-keys';
import { TaskTree } from './types';
import { deserializeBoard, serializeBoard } from './task-serializer';

export const saveBoardToStorage = (userId: string, board: TaskTree) => {
  if (typeof window === 'undefined') return;

  const serializedBoard = serializeBoard(board);
  localStorage.setItem(STORAGE_KEYS.boardByUser(userId), serializedBoard);
};

export const getBoardFromStorage = (userId: string): TaskTree | null => {
  if (typeof window === 'undefined') return null;

  const rawBoard = localStorage.getItem(STORAGE_KEYS.boardByUser(userId));
  if (!rawBoard) return null;

  return deserializeBoard(rawBoard);
};

export const clearBoardFromStorage = (userId: string) => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEYS.boardByUser(userId));
};