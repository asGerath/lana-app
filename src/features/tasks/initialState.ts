import { TasksState } from './types';

export const initialTasksState: TasksState = {
  board: {
    tasksById: {},
    columns: {
      pending: {
        id: 'pending',
        title: 'Por hacer',
        taskIds: [],
      },
      in_progress: {
        id: 'in_progress',
        title: 'En progreso',
        taskIds: [],
      },
      completed: {
        id: 'completed',
        title: 'Completado',
        taskIds: [],
      },
    },
    columnOrder: ['pending', 'in_progress', 'completed'],
  },
  search: '',
  selectedStatus: 'all',
  isLoading: false,
  error: null,
};