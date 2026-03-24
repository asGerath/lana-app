import { appReducer } from './appSlice';

describe('appSlice reducer', () => {
  it('returns the initial state', () => {
    expect(appReducer(undefined, { type: 'unknown' })).toEqual({
      initialized: true,
    });
  });
});
