import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockEstimateGas = vi.fn().mockResolvedValue(25000n);
const mockWait = vi.fn();
const mockTx = { wait: mockWait, receipt: null as any, estimateGas: mockEstimateGas };
const mockTimestamp = vi.fn().mockResolvedValue(mockTx);
const mockClient = {
  eas: { timestamp: mockTimestamp },
};

vi.mock('../../client.js', () => ({
  createEASClient: vi.fn(() => mockClient),
}));

vi.mock('../../output.js', () => ({
  output: vi.fn(),
  handleError: vi.fn(),
}));

import { timestampCommand } from '../../commands/timestamp.js';
import { output } from '../../output.js';

describe('timestamp command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWait.mockImplementation(async () => {
      mockTx.receipt = { hash: '0xtshash' };
      return 1700000000n;
    });
  });

  async function runCommand(args: string[]) {
    await timestampCommand.parseAsync(['node', 'test', ...args]);
  }

  it('timestamps data on-chain', async () => {
    await runCommand(['-d', '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890']);

    expect(mockTimestamp).toHaveBeenCalledWith(
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    );
    expect(output).toHaveBeenCalledWith({
      success: true,
      data: {
        timestamp: '1700000000',
        txHash: '0xtshash',
        data: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        chain: 'ethereum',
      },
    });
  });

  it('passes SDK errors to handleError', async () => {
    mockTimestamp.mockRejectedValueOnce(new Error('nonce too low'));
    await runCommand(['-d', '0x1234']);
    const { handleError } = await import('../../output.js');
    expect(handleError).toHaveBeenCalledWith(expect.any(Error));
    const err = (handleError as any).mock.calls[0][0] as Error;
    expect(err.message).toBe('nonce too low');
  });

  it('uses specified chain', async () => {
    const { createEASClient } = await import('../../client.js');
    await runCommand(['-d', '0x1234', '-c', 'base']);
    expect(createEASClient).toHaveBeenCalledWith('base', undefined);
  });

  it('estimates gas in dry-run mode without sending', async () => {
    await runCommand(['-d', '0x1234', '--dry-run']);

    expect(mockEstimateGas).toHaveBeenCalled();
    expect(mockWait).not.toHaveBeenCalled();
    expect(output).toHaveBeenCalledWith({
      success: true,
      data: { dryRun: true, estimatedGas: '25000', chain: 'ethereum' },
    });
  });
});
