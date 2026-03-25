# EAS CLI

Command-line interface for the [Ethereum Attestation Service](https://attest.org). Built on [EAS SDK v2](https://github.com/ethereum-attestation-service/eas-sdk-v2) and [ethers](https://docs.ethers.org).

Designed to be agent-friendly — all commands support `--json` output for easy parsing.

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

This saves the key to `~/.eas-cli` (file permissions `0600`, owner-only). The command displays your wallet address for confirmation.

To remove the stored key:

```bash
eas clear-key
```

Alternatively, set the `EAS_PRIVATE_KEY` environment variable. When set, it takes priority over the stored key:

```bash
export EAS_PRIVATE_KEY=0xYourPrivateKeyHere
```

## Commands

### Create an Attestation

```bash
eas attest \
  --schema 0xSchemaUID \
  --data '[{"name":"score","type":"uint256","value":"100"},{"name":"comment","type":"string","value":"great work"}]' \
  --recipient 0xRecipientAddress \
  --chain sepolia
```

Supports reading data from stdin:

```bash
echo '[{"name":"score","type":"uint256","value":"100"}]' | eas attest --schema 0xSchemaUID --data - --chain sepolia
```

### Create Multiple Attestations

```bash
eas multi-attest \
  --input '[{"schema":"0xSchemaUID","recipient":"0xAddr","data":[{"name":"score","type":"uint256","value":"100"}]}]' \
  --chain sepolia
```

### Create an Off-Chain Attestation

```bash
eas offchain-attest \
  --schema 0xSchemaUID \
  --data '[{"name":"score","type":"uint256","value":"100"}]' \
  --recipient 0xRecipientAddress \
  --chain sepolia
```

### Revoke an Attestation

```bash
eas revoke \
  --schema 0xSchemaUID \
  --uid 0xAttestationUID \
  --chain sepolia
```

### Revoke Multiple Attestations

```bash
eas multi-revoke \
  --input '[{"schema":"0xSchemaUID","uid":"0xUID1"},{"schema":"0xSchemaUID","uid":"0xUID2"}]' \
  --chain sepolia
```

### Get an Attestation

```bash
eas get-attestation \
  --uid 0xAttestationUID \
  --chain sepolia
```

Auto-decode data by fetching the schema from chain:

```bash
eas get-attestation --uid 0xAttestationUID --decode --chain sepolia
```

Or decode with an explicit schema string:

```bash
eas get-attestation --uid 0xAttestationUID --decode "uint256 score, string comment" --chain sepolia
```

### Register a Schema

```bash
eas schema-register \
  --schema "uint256 score, string comment" \
  --chain sepolia
```

### Get a Schema

```bash
eas schema-get \
  --uid 0xSchemaUID \
  --chain sepolia
```

### Timestamp Data

```bash
eas timestamp \
  --data 0xBytes32Data \
  --chain sepolia
```

### Timestamp Multiple Data Items

```bash
eas multi-timestamp \
  --data '["0xBytes32Data1","0xBytes32Data2"]' \
  --chain sepolia
```

### Query Attestations (GraphQL)

```bash
# By schema UID
eas query-attestations --schema 0xSchemaUID --chain sepolia

# By attester address
eas query-attestations --attester 0xAddress --chain sepolia

# With pagination
eas query-attestations --schema 0xSchemaUID --limit 20 --skip 40 --chain sepolia
```

### Query Schemas (GraphQL)

```bash
eas query-schemas --creator 0xAddress --limit 20 --skip 0 --chain sepolia
```

### Manage Private Key

```bash
# Store your private key
eas set-key 0xYourPrivateKeyHere

# Remove the stored key
eas clear-key
```

### List Supported Chains

```bash
eas chains
```

## Global Options

| Option    | Description                              |
|-----------|------------------------------------------|
| `--json`  | Output results as JSON (agent-friendly)  |
| `--help`  | Display help for any command             |

## Common Options (per command)

| Option           | Description                                      | Default      |
|------------------|--------------------------------------------------|--------------|
| `-c, --chain`    | Target chain                                     | `ethereum`   |
| `--rpc-url`      | Custom RPC endpoint                              | Chain default|
| `--dry-run`      | Estimate gas without sending (write commands)    | —            |

## Supported Chains

Ethereum, Sepolia, Base, Base Sepolia, Optimism, Optimism Sepolia, Arbitrum, Arbitrum Sepolia, Polygon, Scroll, Linea, Celo.

## JSON Mode

Pass `--json` to any command to get structured JSON output. This is designed for agent integrations:

```bash
eas attest --schema 0x... --data '[...]' --chain sepolia --json
```

Returns:

```json
{
  "success": true,
  "data": {
    "uid": "0x...",
    "txHash": "0x...",
    "attester": "0x...",
    "recipient": "0x...",
    "schema": "0x...",
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

## Dry Run

Pass `--dry-run` to any write command to estimate gas without sending a transaction:

```bash
eas attest --schema 0x... --data '[...]' --chain sepolia --dry-run --json
```

```json
{
  "success": true,
  "data": {
    "dryRun": true,
    "estimatedGas": "21000",
    "chain": "sepolia"
  }
}
```

## Stdin Support

Commands that accept `--data` or `--input` can read from stdin by passing `-`:

```bash
cat attestation-data.json | eas attest --schema 0x... --data - --chain sepolia
cat revocations.json | eas multi-revoke --input - --chain sepolia
```

## Agent Integration

This CLI is designed for use as a tool by AI agents. Example MCP/tool definition:

```json
{
  "name": "eas_attest",
  "description": "Create an on-chain attestation on the Ethereum Attestation Service",
  "parameters": {
    "schema": "Schema UID",
    "data": "JSON array of {name, type, value} objects",
    "recipient": "Recipient Ethereum address",
    "chain": "Target chain (default: ethereum)"
  }
}
```

## Development

```bash
npm install
npm run build
node dist/index.js --help
```

## License

MIT
