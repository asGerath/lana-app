import { RootState } from '@/store';
import { TaskFilter, TaskNode } from './types';

const matchesSearch = (task: TaskNode, search: string) => {
  if (!search.trim()) return true;

  const normalizedSearch = search.trim().toLowerCase();

  return (
    task.title.toLowerCase().includes(normalizedSearch) ||
    task.description?.toLowerCase().includes(normalizedSearch)
  );
};

const matchesStatus = (task: TaskNode, selectedStatus: TaskFilter) => {
  if (selectedStatus === 'all') return true;
  if (selectedStatus === 'favorites') return task.favorite;
  return task.status === selectedStatus;
};

export const selectFilteredTasksByColumn = (
  state: RootState,
  columnId: ColumnId,
): TaskNode[] => {
  const { board, search, selectedStatus } = state.tasks;

  const column = board.columns[columnId];

  return column.taskIds
    .map((taskId) => board.tasksById[taskId])
    .filter(Boolean)
    .filter((task) => matchesSearch(task, search))
    .filter((task) => matchesStatus(task, selectedStatus));
};