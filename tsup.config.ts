import { defineConfig } from 'tsup';
import pkg from './package.json';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node18',
  clean: true,
  sourcemap: true,
  noExternal: [
    '@ethereum-attestation-service/eas-sdk',
    '@ethereum-attestation-service/eas-contracts',
    '@ethereum-attestation-service/eas-contracts-legacy',
  ],
  define: {
    'process.env.CLI_VERSION': JSON.stringify(pkg.version),
  },
  banner: {
    js: '#!/usr/bin/env node',
  },
});
