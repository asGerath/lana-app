import { validateOptimisticLock } from './optimistic-lock';

describe('validateOptimisticLock', () => {
  const task = {
    id: 'task-1',
    title: 'Tarea',
    description: '',
    status: 'pending' as const,
    favorite: false,
    createdBy: 'user-1',
    createdAt: 1,
    updatedAt: 1,
    version: 3,
  };

  it('returns true when expected version matches', () => {
    expect(
      validateOptimisticLock({ currentTask: task, expectedVersion: 3 }),
    ).toBe(true);
  });

  it('returns false when expected version does not match', () => {
    expect(
      validateOptimisticLock({ currentTask: task, expectedVersion: 2 }),
    ).toBe(false);
  });
});
