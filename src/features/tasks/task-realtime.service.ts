import { TaskTree } from './types';

type TaskRealtimeEvent =
  | { type: 'board-updated'; payload: TaskTree }
  | { type: 'task-created'; payload: { taskId: string } }
  | { type: 'task-updated'; payload: { taskId: string } }
  | { type: 'task-deleted'; payload: { taskId: string } };

type Listener = (event: TaskRealtimeEvent) => void;

class TaskRealtimeService {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: TaskRealtimeEvent) {
    this.listeners.forEach((listener) => listener(event));
  }
}

export const taskRealtimeService = new TaskRealtimeService();