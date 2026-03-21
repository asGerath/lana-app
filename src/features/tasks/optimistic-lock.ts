import { TaskNode } from './types';

type LockValidationParams = {
  currentTask: TaskNode;
  expectedVersion: number;
};

export const validateOptimisticLock = ({
  currentTask,
  expectedVersion,
}: LockValidationParams): boolean => {
  return currentTask.version === expectedVersion;
};