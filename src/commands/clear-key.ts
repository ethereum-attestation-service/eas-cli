import { Command } from 'commander';
import { clearStoredPrivateKey, getStoredPrivateKey } from '../config.js';
import { output } from '../output.js';

export const clearKeyCommand = new Command('clear-key')
  .description('Remove the stored private key from ~/.easctl')
  .action(() => {
    if (!getStoredPrivateKey()) {
      output({ success: true, data: { cleared: false, message: 'No private key is currently stored' } });
      return;
    }

    clearStoredPrivateKey();
    output({ success: true, data: { cleared: true } });
  });
