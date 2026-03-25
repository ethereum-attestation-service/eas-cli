import { Command } from 'commander';
import { graphqlQuery, QUERIES } from '../graphql.js';
import { output, handleError } from '../output.js';
import { validateAddress } from '../validation.js';

export const querySchemasCommand = new Command('query-schemas')
  .description('Query schemas by creator from the EAS GraphQL API')
  .requiredOption('-a, --creator <address>', 'Creator address')
  .option('-n, --limit <number>', 'Max results to return', '10')
  .option('--skip <number>', 'Number of results to skip (for pagination)', '0')
  .option('-c, --chain <name>', 'Chain name', 'ethereum')
  .action(async (opts) => {
    try {
      validateAddress(opts.creator, 'creator');

      const take = parseInt(opts.limit, 10);
      const skip = parseInt(opts.skip, 10);
      if (isNaN(take) || take < 1) throw new Error('--limit must be a positive integer');
      if (isNaN(skip) || skip < 0) throw new Error('--skip must be a non-negative integer');
      const data = await graphqlQuery(opts.chain, QUERIES.getSchemata, {
        creator: opts.creator,
        take,
        skip,
      });

      const schemas = data.schemata || [];

      output({
        success: true,
        data: { count: schemas.length, schemas },
      });
    } catch (err) {
      handleError(err);
    }
  });
