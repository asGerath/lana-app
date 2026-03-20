import LZString from 'lz-string';
import { TaskTree } from './types';

export const serializeBoard = (board: TaskTree): string => {
  const json = JSON.stringify(board);
  return LZString.compressToUTF16(json);
};

export const deserializeBoard = (value: string): TaskTree | null => {
  try {
    const decompressed = LZString.decompressFromUTF16(value);

    if (!decompressed) return null;

    return JSON.parse(decompressed) as TaskTree;
  } catch {
    return null;
  }
};