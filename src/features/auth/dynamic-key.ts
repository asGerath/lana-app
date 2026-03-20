import CryptoJS from 'crypto-js';

export const generateDynamicKey = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2);

  const raw = `${timestamp}-${random}`;

  const hash = CryptoJS.SHA256(raw).toString(CryptoJS.enc.Hex);

  return {
    key: hash,
    timestamp,
  };
};