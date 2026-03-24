import { generateTaskId } from './task-id';

describe('task-id', () => {
  it('generates deterministic prefix with user and timestamp pattern', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    const id = generateTaskId({ userId: 'user-1', title: 'Mi tarea' });

    expect(id).toMatch(/^task-user-1-1700000000000-[a-f0-9]{10}$/);

    jest.restoreAllMocks();
  });
});
