import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../output.js', () => ({
  output: vi.fn(),
  handleError: vi.fn(),
}));

vi.mock('../../config.js', () => ({
  getStoredPrivateKey: vi.fn(() => undefined),
}));

import { statusCommand } from '../../commands/status.js';
import { output } from '../../output.js';
import { getStoredPrivateKey } from '../../config.js';

describe('status command', () => {
  const originalEnv = process.env.EAS_PRIVATE_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.EAS_PRIVATE_KEY;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.EAS_PRIVATE_KEY = originalEnv;
    } else {
      delete process.env.EAS_PRIVATE_KEY;
    }
  });

  async function runCommand(args: string[] = []) {
    await statusCommand.parseAsync(['node', 'test', ...args]);
  }

  it('shows key not set when no key is configured', async () => {
    await runCommand();

    expect(output).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        wallet: { privateKey: 'not set', address: 'n/a' },
      }),
    });
  });

  it('shows address from env var with source', async () => {
    process.env.EAS_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    await runCommand();

    expect(output).toHaveBeenCalledWith({
      success: true,
      data: expect.objectContaining({
        wallet: {
          privateKey: 'set (env)',
          address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        },
      }),
    });
  });

  it('shows address from stored key', async () => {
    vi.mocked(getStoredPrivateKey).mockReturnValue('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
    await runCommand();

    const call = (output as any).mock.calls[0][0];
    expect(call.data.wallet.privateKey).toBe('set (stored)');
    expect(call.data.wallet.address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  });

  it('shows address when key has no 0x prefix', async () => {
    process.env.EAS_PRIVATE_KEY = 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
    await runCommand();

    const call = (output as any).mock.calls[0][0];
    expect(call.data.wallet.privateKey).toBe('set (env)');
    expect(call.data.wallet.address).toBe('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  });

  it('shows invalid format for a bad key', async () => {
    process.env.EAS_PRIVATE_KEY = 'not-a-real-key';
    await runCommand();

    const call = (output as any).mock.calls[0][0];
    expect(call.data.wallet.privateKey).toBe('set (invalid format)');
    expect(call.data.wallet.address).toBe('n/a');
  });

  it('defaults to ethereum chain', async () => {
    await runCommand();

    const call = (output as any).mock.calls[0][0];
    expect(call.data.chain.name).toBe('ethereum');
    expect(call.data.chain.chainId).toBe(1);
  });

  it('shows correct config for --chain base', async () => {
    await runCommand(['--chain', 'base']);

    const call = (output as any).mock.calls[0][0];
    expect(call.data.chain.name).toBe('base');
    expect(call.data.chain.chainId).toBe(8453);
    expect(call.data.contracts.eas).toBe('0x4200000000000000000000000000000000000021');
  });

  it('uses custom rpc-url when provided', async () => {
    await runCommand(['--rpc-url', 'https://custom.rpc']);

    const call = (output as any).mock.calls[0][0];
    expect(call.data.chain.rpcUrl).toBe('https://custom.rpc');
  });

  it('lists supported chains', async () => {
    await runCommand();

    const call = (output as any).mock.calls[0][0];
    expect(call.data.supportedChains).toContain('ethereum');
    expect(call.data.supportedChains).toContain('base');
    expect(call.data.supportedChains).toContain('sepolia');
  });
});
