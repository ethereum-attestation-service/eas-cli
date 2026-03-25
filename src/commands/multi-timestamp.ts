import { Command } from 'commander';
import { createEASClient } from '../client.js';
import { output, handleError } from '../output.js';
import { resolveInput } from '../stdin.js';

export const multiTimestampCommand = new Command('multi-timestamp')
  .description('Timestamp multiple data items in a single transaction')
  .requiredOption('-d, --data <json>', 'JSON array of bytes32 hex strings to timestamp')
  .option('-c, --chain <name>', 'Chain name', 'ethereum')
  .option('--rpc-url <url>', 'Custom RPC URL')
  .option('--dry-run', 'Estimate gas without sending the transaction')
  .action(async (opts) => {
    try {
      const client = createEASClient(opts.chain, opts.rpcUrl);
      const rawData = await resolveInput(opts.data);
      let items: string[];
      try {
        items = JSON.parse(rawData);
      } catch (e) {
        throw new Error(`Invalid JSON in --data: ${e instanceof Error ? e.message : e}`);
      }

      const tx = await client.eas.multiTimestamp(items);

      if (opts.dryRun) {
        const gasEstimate = await tx.estimateGas();
        output({ success: true, data: { dryRun: true, estimatedGas: gasEstimate.toString(), chain: opts.chain } });
      } else {
        const timestamps = await tx.wait();
        output({
          success: true,
          data: {
            timestamps: timestamps.map((t) => t.toString()),
            count: timestamps.length,
            txHash: tx.receipt!.hash,
            chain: opts.chain,
          },
        });
      }
    } catch (err) {
      handleError(err);
    }
  });
