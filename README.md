# EAS CLI

Command-line interface for the [Ethereum Attestation Service](https://attest.org). Built on [EAS SDK v2](https://github.com/ethereum-attestation-service/eas-sdk-v2) and [ethers](https://docs.ethers.org).

All commands support `--json` for structured output and `--dry-run` for gas estimation without sending transactions.

## Installation

```bash
npm install -g @ethereum-attestation-service/eas-cli
```

Or run directly with npx:

```bash
npx @ethereum-attestation-service/eas-cli --help
```

## Configuration

Store your private key for persistent use:

```bash
eas set-key 0xYourPrivateKeyHere
```

This saves the key to `~/.eas-cli` (file permissions `0600`, owner-only) and displays your wallet address for confirmation.

To remove the stored key:

```bash
eas clear-key
```

Alternatively, set the `EAS_PRIVATE_KEY` environment variable. When set, it takes priority over the stored key:

```bash
export EAS_PRIVATE_KEY=0xYourPrivateKeyHere
```

## Commands

### Attestations

```bash
# Create an on-chain attestation
eas attest \
  --schema 0xSchemaUID \
  --data '[{"name":"score","type":"uint256","value":"100"}]' \
  --recipient 0xRecipientAddress \
  --chain sepolia

# Create multiple attestations in one transaction
eas multi-attest \
  --input '[{"schema":"0xSchemaUID","recipient":"0xAddr","data":[{"name":"score","type":"uint256","value":"100"}]}]' \
  --chain sepolia

# Create an off-chain (signed, not submitted) attestation
eas offchain-attest \
  --schema 0xSchemaUID \
  --data '[{"name":"score","type":"uint256","value":"100"}]' \
  --recipient 0xRecipientAddress \
  --chain sepolia

# Revoke an attestation
eas revoke --schema 0xSchemaUID --uid 0xAttestationUID --chain sepolia

# Revoke multiple attestations in one transaction
eas multi-revoke \
  --input '[{"schema":"0xSchemaUID","uid":"0xUID1"},{"schema":"0xSchemaUID","uid":"0xUID2"}]' \
  --chain sepolia

# Get an attestation by UID (read-only, no key required)
eas get-attestation --uid 0xAttestationUID --chain sepolia

# Auto-decode attestation data by fetching its schema from chain
eas get-attestation --uid 0xAttestationUID --decode --chain sepolia

# Decode with an explicit schema string
eas get-attestation --uid 0xAttestationUID --decode "uint256 score, string comment" --chain sepolia
```

### Schemas

```bash
# Register a new schema
eas schema-register --schema "uint256 score, string comment" --chain sepolia

# Get a schema by UID (read-only)
eas schema-get --uid 0xSchemaUID --chain sepolia
```

### Timestamps

```bash
# Timestamp a single data item on-chain
eas timestamp --data 0xBytes32Data --chain sepolia

# Timestamp multiple data items in one transaction
eas multi-timestamp --data '["0xBytes32Data1","0xBytes32Data2"]' --chain sepolia
```

### Queries

Query attestations and schemas from the EASScan indexer. Read-only, no private key required.

```bash
# Query a single attestation
eas query-attestation --uid 0xAttestationUID --chain sepolia

# Query a single schema
eas query-schema --uid 0xSchemaUID --chain sepolia

# Query attestations by schema or attester, with pagination
eas query-attestations --schema 0xSchemaUID --limit 20 --skip 40 --chain sepolia
eas query-attestations --attester 0xAddress --chain sepolia

# Query schemas by creator
eas query-schemas --creator 0xAddress --limit 20 --chain sepolia
```

### Utility

```bash
# List supported chains
eas chains
```

## Options

### Global

| Option    | Description                              |
|-----------|------------------------------------------|
| `--json`  | Output results as JSON                   |
| `--help`  | Display help for any command             |

### Per command

| Option           | Description                                      | Default      |
|------------------|--------------------------------------------------|--------------|
| `-c, --chain`    | Target chain                                     | `ethereum`   |
| `--rpc-url`      | Custom RPC endpoint                              | Chain default|
| `--dry-run`      | Estimate gas without sending (write commands)    | -            |

## Supported Chains

Ethereum, Sepolia, Base, Base Sepolia, Optimism, Optimism Sepolia, Arbitrum, Arbitrum Sepolia, Polygon, Scroll, Linea, Celo.

## JSON Output

All commands return structured JSON when `--json` is passed:

```json
{
  "success": true,
  "data": {
    "uid": "0x...",
    "txHash": "0x...",
    "attester": "0x...",
    "chain": "sepolia"
  }
}
```

On error:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Stdin Support

Commands that accept `--data` or `--input` can read from stdin by passing `-`:

```bash
cat attestation-data.json | eas attest --schema 0x... --data - --chain sepolia
cat revocations.json | eas multi-revoke --input - --chain sepolia
```

## Development

```bash
npm install
npm run build
npm run test
node dist/index.js --help
```

## License

MIT
