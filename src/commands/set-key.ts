import { Command } from 'commander';
import { ethers } from 'ethers';
import { setStoredPrivateKey } from '../config.js';
import { output, handleError } from '../output.js';

export const setKeyCommand = new Command('set-key')
  .description('Store your private key in ~/.eas-cli for future use')
  .argument('<key>', 'Wallet private key (hex string, with or without 0x prefix)')
  .action((key: string) => {
    const normalized = key.startsWith('0x') ? key : `0x${key}`;

    try {
      const wallet = new ethers.Wallet(normalized);
      setStoredPrivateKey(key);
      output({ success: true, data: { address: wallet.address } });
    } catch {
      handleError(new Error('Invalid private key format'));
    }
  });
