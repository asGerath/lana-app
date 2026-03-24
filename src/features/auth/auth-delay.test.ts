import { simulateNetworkDelay } from './auth-delay';

describe('simulateNetworkDelay', () => {
  it('waits for a randomized delay between 300 and 1299ms', async () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const promise = simulateNetworkDelay();

    jest.advanceTimersByTime(799);
    await expect(Promise.race([promise, Promise.resolve('pending')])).resolves.toBe(
      'pending',
    );

    jest.advanceTimersByTime(1);
    await expect(promise).resolves.toBeUndefined();

    jest.useRealTimers();
    jest.restoreAllMocks();
  });
});
