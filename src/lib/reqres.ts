import axios from 'axios';

const reqresApiKey = process.env.NEXT_PUBLIC_REQRES_API_KEY?.trim() || '';
const hasValidReqresApiKey = reqresApiKey.length > 0 && reqresApiKey !== 'tu_api_key_aqui';

export const reqresClient = axios.create({
  baseURL: 'https://reqres.in/api',
  headers: {
    'Content-Type': 'application/json',
    ...(hasValidReqresApiKey ? { 'x-api-key': reqresApiKey } : {}),
  },
});

export const isReqresConfigured = hasValidReqresApiKey;