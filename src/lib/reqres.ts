const reqresApiKey = process.env.REQRES_API_KEY?.trim() || '';
const hasValidReqresApiKey =
  reqresApiKey.length > 0 && reqresApiKey !== 'tu_api_key_aqui';

export const REQRES_BASE_URL = 'https://reqres.in/api';

export const getReqresHeaders = () => ({
  'Content-Type': 'application/json',
  ...(hasValidReqresApiKey ? { 'x-api-key': reqresApiKey } : {}),
});

export const isReqresConfigured = hasValidReqresApiKey;