import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config.js', () => ({
  setStoredPrivateKey: vi.fn(),
}));

vi.mock('../output.js', () => ({
  output: vi.fn(),
  handleError: vi.fn(),
}));

const mockWalletAddress = '0xMockWalletAddress';
vi.mock('ethers', () => ({
  ethers: {
    Wallet: class MockWallet {
      address = mockWalletAddress;
      constructor(key: string) {
        if (key === '0xinvalid') throw new Error('invalid private key');
      }
    },
  },
}));

import { setKeyCommand } from '../commands/set-key.js';
import { setStoredPrivateKey } from '../config.js';
import { output, handleError } from '../output.js';

describe('set-key command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('stores key and outputs wallet address', async () => {
    await setKeyCommand.parseAsync(['node', 'test', '0xabc123']);
    expect(setStoredPrivateKey).toHaveBeenCalledWith('0xabc123');
    expect(output).toHaveBeenCalledWith({
      success: true,
      data: { address: mockWalletAddress },
    });
  });

  it('rejects invalid key', async () => {
    await setKeyCommand.parseAsync(['node', 'test', 'invalid']);
    expect(handleError).toHaveBeenCalledWith(expect.any(Error));
    const err = (handleError as any).mock.calls[0][0] as Error;
    expect(err.message).toBe('Invalid private key format');
  });

  it('normalizes key without 0x prefix', async () => {
    await setKeyCommand.parseAsync(['node', 'test', 'abc123']);
    expect(setStoredPrivateKey).toHaveBeenCalledWith('abc123');
  });

  it('handles key with 0x prefix', async () => {
    await setKeyCommand.parseAsync(['node', 'test', '0xabc123']);
    expect(setStoredPrivateKey).toHaveBeenCalledWith('0xabc123');
  });
});
