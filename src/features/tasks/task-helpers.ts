import { generateTaskId } from './task-id';
import { ColumnId, TaskNode, TaskTree } from './types';

type CreateTaskParams = {
  title: string;
  createdBy: string;
  status?: ColumnId;
  description?: string;
};

export const normalizeTaskTitle = (title: string): string => {
  return title.trim().toLowerCase();
};

export const taskTitleExists = (board: TaskTree, title: string): boolean => {
  const normalizedTitle = normalizeTaskTitle(title);

  return Object.values(board.tasksById).some(
    (task) => normalizeTaskTitle(task.title) === normalizedTitle,
  );
};

export const buildTaskNode = ({
  title,
  createdBy,
  status = 'pending',
  description = '',
}: CreateTaskParams): TaskNode => {
  const now = Date.now();

  return {
    id: generateTaskId({ userId: createdBy, title }),
    title: title.trim(),
    description: description.trim(),
    status,
    favorite: false,
    createdBy,
    createdAt: now,
    updatedAt: now,
    version: 1,
  };
};