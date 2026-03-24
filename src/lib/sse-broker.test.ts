import { sseBroker } from './sse-broker';

describe('sseBroker', () => {
  it('publishes SSE chunks only to listeners of the target user', () => {
    const sendUserOne = jest.fn();
    const sendUserTwo = jest.fn();
    const userOneHandle = sseBroker.addClient('user-1', sendUserOne);
    const userTwoHandle = sseBroker.addClient('user-2', sendUserTwo);

    sseBroker.publishToUser('user-1', 'board-updated', { ok: true });

    expect(sendUserOne).toHaveBeenCalledWith(
      expect.stringContaining('event: board-updated'),
    );
    expect(sendUserOne).toHaveBeenCalledWith(
      expect.stringContaining('"ok":true'),
    );
    expect(sendUserTwo).not.toHaveBeenCalled();

    userOneHandle.remove();
    userTwoHandle.remove();
  });

  it('removes broken listeners when a send operation throws', () => {
    const failingSend = jest.fn(() => {
      throw new Error('broken socket');
    });

    sseBroker.addClient('user-broken', failingSend);

    expect(sseBroker.count('user-broken')).toBe(1);

    sseBroker.publishToUser('user-broken', 'board-updated', { ok: true });

    expect(failingSend).toHaveBeenCalled();
    expect(sseBroker.count('user-broken')).toBe(0);
  });
});