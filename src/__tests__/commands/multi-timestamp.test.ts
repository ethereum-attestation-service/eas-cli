import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockEstimateGas = vi.fn().mockResolvedValue(35000n);
const mockWait = vi.fn();
const mockTx = { wait: mockWait, receipt: null as any, estimateGas: mockEstimateGas };
const mockMultiTimestamp = vi.fn().mockResolvedValue(mockTx);
const mockClient = {
  eas: { multiTimestamp: mockMultiTimestamp },
};

vi.mock('../../client.js', () => ({
  createEASClient: vi.fn(() => mockClient),
}));

vi.mock('../../output.js', () => ({
  output: vi.fn(),
  handleError: vi.fn(),
}));

vi.mock('../../stdin.js', () => ({
  resolveInput: vi.fn((v: string) => Promise.resolve(v)),
}));

import { multiTimestampCommand } from '../../commands/multi-timestamp.js';
import { output, handleError } from '../../output.js';

describe('multi-timestamp command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWait.mockImplementation(async () => {
      mockTx.receipt = { hash: '0xmultitshash' };
      return [1700000000n, 1700000001n];
    });
  });

  async function runCommand(args: string[]) {
    await multiTimestampCommand.parseAsync(['node', 'test', ...args]);
  }

  it('timestamps multiple data items', async () => {
    const data = JSON.stringify(['0xdata1', '0xdata2']);

    await runCommand(['-d', data]);

    expect(mockMultiTimestamp).toHaveBeenCalledWith(['0xdata1', '0xdata2']);
    expect(output).toHaveBeenCalledWith({
      success: true,
      data: {
        timestamps: ['1700000000', '1700000001'],
        count: 2,
        txHash: '0xmultitshash',
        chain: 'ethereum',
      },
    });
  });

  it('handles invalid JSON in --data', async () => {
    await runCommand(['-d', 'not-json']);
    expect(handleError).toHaveBeenCalledWith(expect.any(Error));
    const err = (handleError as any).mock.calls[0][0] as Error;
    expect(err.message).toContain('Invalid JSON in --data');
  });

  it('passes SDK errors to handleError', async () => {
    mockMultiTimestamp.mockRejectedValueOnce(new Error('tx failed'));
    await runCommand(['-d', '["0xdata1"]']);
    expect(handleError).toHaveBeenCalledWith(expect.any(Error));
    const err = (handleError as any).mock.calls[0][0] as Error;
    expect(err.message).toBe('tx failed');
  });

  it('uses specified chain', async () => {
    const { createEASClient } = await import('../../client.js');
    await runCommand(['-d', '["0xdata1"]', '-c', 'base']);
    expect(createEASClient).toHaveBeenCalledWith('base', undefined);
  });

  it('estimates gas in dry-run mode without sending', async () => {
    await runCommand(['-d', '["0xdata1"]', '--dry-run']);

    expect(mockEstimateGas).toHaveBeenCalled();
    expect(mockWait).not.toHaveBeenCalled();
    expect(output).toHaveBeenCalledWith({
      success: true,
      data: { dryRun: true, estimatedGas: '35000', chain: 'ethereum' },
    });
  });
});
