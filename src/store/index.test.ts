describe('store', () => {
  it('exposes the configured reducers in the root state', async () => {
    const { store } = await import('./index');

    expect(store.getState()).toEqual(
      expect.objectContaining({
        app: expect.any(Object),
        auth: expect.any(Object),
        tasks: expect.any(Object),
      }),
    );
  });
});
