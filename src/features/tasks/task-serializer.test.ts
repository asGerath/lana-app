import { initialTasksState } from './initialState';
import { deserializeBoard, serializeBoard } from './task-serializer';

describe('task-serializer', () => {
  it('serializes and deserializes board without data loss', () => {
    const serialized = serializeBoard(initialTasksState.board);
    const deserialized = deserializeBoard(serialized);

    expect(deserialized).toEqual(initialTasksState.board);
  });

  it('returns null for invalid serialized payload', () => {
    expect(deserializeBoard('not-compressed-data')).toBeNull();
  });
});
