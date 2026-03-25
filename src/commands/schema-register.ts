import { Command } from 'commander';
import { createEASClient } from '../client.js';
import { output, handleError } from '../output.js';
import { validateAddress } from '../validation.js';

export const schemaRegisterCommand = new Command('schema-register')
  .description('Register a new schema')
  .requiredOption('-s, --schema <definition>', 'Schema definition (e.g. "uint256 score, string name")')
  .option('--resolver <address>', 'Resolver contract address', '0x0000000000000000000000000000000000000000')
  .option('--revocable', 'Whether attestations using this schema can be revoked', true)
  .option('--no-revocable', 'Make attestations non-revocable')
  .option('-c, --chain <name>', 'Chain name', 'ethereum')
  .option('--rpc-url <url>', 'Custom RPC URL')
  .option('--dry-run', 'Estimate gas without sending the transaction')
  .action(async (opts) => {
    try {
      if (opts.resolver !== '0x0000000000000000000000000000000000000000') {
        validateAddress(opts.resolver, 'resolver');
      }

      const client = createEASClient(opts.chain, opts.rpcUrl);

      const tx = await client.schemaRegistry.register({
        schema: opts.schema,
        resolverAddress: opts.resolver,
        revocable: opts.revocable,
      });

      if (opts.dryRun) {
        const gasEstimate = await tx.estimateGas();
        output({ success: true, data: { dryRun: true, estimatedGas: gasEstimate.toString(), chain: opts.chain } });
      } else {
        const uid = await tx.wait();
        output({
          success: true,
          data: {
            uid,
            txHash: tx.receipt!.hash,
            schema: opts.schema,
            resolver: opts.resolver,
            revocable: opts.revocable,
            chain: opts.chain,
          },
        });
      }
    } catch (err) {
      handleError(err);
    }
  });
