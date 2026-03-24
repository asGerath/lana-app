import { taskRealtimeService } from './task-realtime.service';

describe('taskRealtimeService', () => {
  it('notifies subscribed listeners', () => {
    const listener = jest.fn();
    const event = {
      type: 'task-created' as const,
      payload: { taskId: 'task-1' },
    };

    const unsubscribe = taskRealtimeService.subscribe(listener);

    taskRealtimeService.emit(event);

    expect(listener).toHaveBeenCalledWith(event);

    unsubscribe();
  });

  it('stops notifying listeners after unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = taskRealtimeService.subscribe(listener);

    unsubscribe();
    taskRealtimeService.emit({
      type: 'task-deleted',
      payload: { taskId: 'task-1' },
    });

    expect(listener).not.toHaveBeenCalled();
  });
});
