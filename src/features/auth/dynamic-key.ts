import CryptoJS from 'crypto-js';

export type DynamicKeyPayload = {
  key: string;
  timestamp: string;
  nonce: string;
};

export const generateDynamicKey = () => {
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substring(2);

  const raw = `${timestamp}-${nonce}`;

  const hash = CryptoJS.SHA256(raw).toString(CryptoJS.enc.Hex);

  return {
    key: hash,
    timestamp,
    nonce,
  };
};