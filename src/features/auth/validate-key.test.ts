import CryptoJS from 'crypto-js';
import { validateDynamicKey } from './validate-key';

describe('validateDynamicKey', () => {
  const now = 1_700_000_000_000;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns true for a valid key within allowed time window', () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const timestamp = String(now - 2_000);
    const nonce = 'nonce-123';
    const key = CryptoJS.SHA256(`${timestamp}-${nonce}`).toString(
      CryptoJS.enc.Hex,
    );

    expect(validateDynamicKey({ key, timestamp, nonce })).toBe(true);
  });

  it('returns false when key hash does not match', () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const timestamp = String(now - 2_000);

    expect(
      validateDynamicKey({
        key: 'invalid-key',
        timestamp,
        nonce: 'nonce-123',
      }),
    ).toBe(false);
  });

  it('returns false when timestamp is expired', () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const timestamp = String(now - 12_000);
    const nonce = 'nonce-123';
    const key = CryptoJS.SHA256(`${timestamp}-${nonce}`).toString(
      CryptoJS.enc.Hex,
    );

    expect(validateDynamicKey({ key, timestamp, nonce })).toBe(false);
  });
});
