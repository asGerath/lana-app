import CryptoJS from 'crypto-js';
import { DynamicKeyPayload } from './dynamic-key';

export const validateDynamicKey = ({
  key,
  timestamp,
  nonce,
}: DynamicKeyPayload): boolean => {
  const now = Date.now();
  const keyTime = Number(timestamp);
  const expectedKey = CryptoJS.SHA256(`${timestamp}-${nonce}`).toString(
    CryptoJS.enc.Hex,
  );

  const isValidTime =
    Number.isFinite(keyTime) && keyTime <= now && now - keyTime < 10000;
  const isValidKey = key === expectedKey;

  return Boolean(key && nonce && isValidTime && isValidKey);
};