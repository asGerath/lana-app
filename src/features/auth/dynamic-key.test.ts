import CryptoJS from 'crypto-js';
import { generateDynamicKey } from './dynamic-key';

describe('generateDynamicKey', () => {
  it('builds a hash from timestamp and nonce', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);

    const result = generateDynamicKey();

    expect(result.timestamp).toBe('1700000000000');
    expect(result.nonce).toBe('4fzzzxjylrx');
    expect(result.key).toBe(
      CryptoJS.SHA256('1700000000000-4fzzzxjylrx').toString(CryptoJS.enc.Hex),
    );

    jest.restoreAllMocks();
  });
});
