import { TaskTree } from './types';

type CacheEntry = {
  data: TaskTree;
  timestamp: number;
};

class TaskCache {
  private cache = new Map<string, CacheEntry>();

  get(userId: string): TaskTree | null {
    const entry = this.cache.get(userId);
    if (!entry) return null;

    return entry.data;
  }

  set(userId: string, data: TaskTree) {
    this.cache.set(userId, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(userId?: string) {
    if (userId) {
      this.cache.delete(userId);
      return;
    }

    this.cache.clear();
  }

  has(userId: string) {
    return this.cache.has(userId);
  }
}

export const taskCache = new TaskCache();