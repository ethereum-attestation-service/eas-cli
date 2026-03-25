import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config.js', () => ({
  clearStoredPrivateKey: vi.fn(),
  getStoredPrivateKey: vi.fn(),
}));

vi.mock('../output.js', () => ({
  output: vi.fn(),
}));

import { clearKeyCommand } from '../commands/clear-key.js';
import { clearStoredPrivateKey, getStoredPrivateKey } from '../config.js';
import { output } from '../output.js';

describe('clear-key command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears the stored key', async () => {
    vi.mocked(getStoredPrivateKey).mockReturnValue('0xabc');
    await clearKeyCommand.parseAsync(['node', 'test']);
    expect(clearStoredPrivateKey).toHaveBeenCalled();
    expect(output).toHaveBeenCalledWith({
      success: true,
      data: { cleared: true },
    });
  });

  it('reports when no key is stored', async () => {
    vi.mocked(getStoredPrivateKey).mockReturnValue(undefined);
    await clearKeyCommand.parseAsync(['node', 'test']);
    expect(clearStoredPrivateKey).not.toHaveBeenCalled();
    expect(output).toHaveBeenCalledWith({
      success: true,
      data: { cleared: false, message: 'No private key is currently stored' },
    });
  });
});
