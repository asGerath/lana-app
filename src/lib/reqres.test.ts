const importReqresModule = async (apiKey?: string) => {
  jest.resetModules();

  if (typeof apiKey === 'undefined') {
    delete process.env.REQRES_API_KEY;
  } else {
    process.env.REQRES_API_KEY = apiKey;
  }

  return import('./reqres');
};

describe('reqres config', () => {
  afterEach(() => {
    delete process.env.REQRES_API_KEY;
  });

  it('does not expose x-api-key when env is missing', async () => {
    const reqres = await importReqresModule();

    expect(reqres.isReqresConfigured).toBe(false);
    expect(reqres.getReqresHeaders()).toEqual({
      'Content-Type': 'application/json',
    });
  });

  it('does not accept placeholder key values', async () => {
    const reqres = await importReqresModule('tu_api_key_aqui');

    expect(reqres.isReqresConfigured).toBe(false);
    expect(reqres.getReqresHeaders()).toEqual({
      'Content-Type': 'application/json',
    });
  });

  it('adds x-api-key when a valid env var is provided', async () => {
    const reqres = await importReqresModule('real-key');

    expect(reqres.REQRES_BASE_URL).toBe('https://reqres.in/api');
    expect(reqres.isReqresConfigured).toBe(true);
    expect(reqres.getReqresHeaders()).toEqual({
      'Content-Type': 'application/json',
      'x-api-key': 'real-key',
    });
  });
});
