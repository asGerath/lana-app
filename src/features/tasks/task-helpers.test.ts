import { initialTasksState } from './initialState';
import {
  buildTaskNode,
  normalizeTaskTitle,
  taskTitleExists,
} from './task-helpers';

describe('task-helpers', () => {
  it('normalizes title using trim and lowercase', () => {
    expect(normalizeTaskTitle('  Mi Tarea  ')).toBe('mi tarea');
  });

  it('detects duplicated titles case-insensitively', () => {
    const board = JSON.parse(
      JSON.stringify(initialTasksState.board),
    ) as typeof initialTasksState.board;
    board.tasksById['task-1'] = {
      id: 'task-1',
      title: 'Primera Tarea',
      description: '',
      status: 'pending',
      favorite: false,
      createdBy: 'user-1',
      createdAt: 1,
      updatedAt: 1,
      version: 1,
    };

    expect(taskTitleExists(board, ' primera tarea ')).toBe(true);
    expect(taskTitleExists(board, 'otra tarea')).toBe(false);
  });

  it('builds task node with trimmed text and defaults', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    const task = buildTaskNode({
      title: '  Nueva tarea  ',
      description: '  descripcion  ',
      createdBy: 'user-1',
    });

    expect(task.title).toBe('Nueva tarea');
    expect(task.description).toBe('descripcion');
    expect(task.status).toBe('pending');
    expect(task.favorite).toBe(false);
    expect(task.version).toBe(1);
    expect(task.createdAt).toBe(1_700_000_000_000);

    jest.restoreAllMocks();
  });
});
