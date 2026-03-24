export type ColumnId = 'pending' | 'in_progress' | 'completed';

export type TaskStatus = ColumnId;

export type TaskNode = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  favorite: boolean;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  version: number;
};

export type Column = {
  id: ColumnId;
  title: string;
  taskIds: string[];
};

export type TaskTree = {
  tasksById: Record<string, TaskNode>;
  columns: Record<ColumnId, Column>;
  columnOrder: ColumnId[];
};

export type TaskFilter = ColumnId | 'all' | 'favorites';

export type TasksState = {
  board: TaskTree;
  search: string;
  selectedStatus: TaskFilter;
  isLoading: boolean;
  error: string | null;
};

// define los tipos de acciones para las tareas