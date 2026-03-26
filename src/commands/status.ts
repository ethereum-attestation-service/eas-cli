import { Command } from 'commander';
import { ethers } from 'ethers';
import { CHAIN_CONFIGS, listChains } from '../chains.js';
import { output } from '../output.js';
import { getStoredPrivateKey } from '../config.js';

export const statusCommand = new Command('status')
  .description('Show current configuration: wallet, chain, and contract addresses')
  .option('-c, --chain <name>', 'Chain name', 'ethereum')
  .option('--rpc-url <url>', 'Custom RPC URL')
  .action(async (opts) => {
    const key = process.env.EAS_PRIVATE_KEY || getStoredPrivateKey();
    const source = process.env.EAS_PRIVATE_KEY ? 'env' : key ? 'stored' : undefined;
    let address: string | undefined;

    if (key) {
      try {
        const normalized = key.startsWith('0x') ? key : `0x${key}`;
        address = new ethers.Wallet(normalized).address;
      } catch {
        // invalid key format
      }
    }

    const chainConfig = CHAIN_CONFIGS[opts.chain];
    const rpcUrl = opts.rpcUrl || chainConfig?.defaultRpc || 'none';

    output({
      success: true,
      data: {
        wallet: {
          privateKey: source ? (address ? `set (${source})` : `set (invalid format)`) : 'not set',
          address: address || 'n/a',
        },
        chain: {
          name: opts.chain,
          chainId: chainConfig?.chainId ?? 'unknown chain',
          rpcUrl,
        },
        contracts: chainConfig
          ? {
              eas: chainConfig.eas,
              schemaRegistry: chainConfig.schemaRegistry,
            }
          : 'unknown chain',
        supportedChains: listChains().join(', '),
      },
    });
  });
