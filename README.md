# cfx-to-eth-rpc-bridge

This is a Conflux-to-ETH RPC bridge, which can help adapt Conflux RPC into ETH RPC.

## How to run

To run this service, you need a Conflux Core RPC service.

1. Clone the source code
2. Add a config file: `cp config.json.sample config.json`, and update `url` field in config file to Conflux RPC url.
3. Install dependencies: `npm install`
4. Start the service: `node index.js`

## Compatibility

### Methods

| Method                 | Status      | Note    |
| ---------------------- | ----------- |-------- |
| web3_clientVersion     | ✅       |  |
| net_version | ✅       |  |
| eth_chainId | ✅ | |
| eth_gasPrice | ✅ | |
| eth_blockNumber | ✅ | |
| eth_getBalance | ✅ | |
| eth_getStorageAt | ✅ | |
| eth_getCode | ✅ | |
| eth_getTransactionCount | ✅ | |
| eth_sendRawTransaction | ✅ | |
| eth_submitTransaction | ✅ | |
| eth_call | ✅ | |
| eth_estimateGas | ✅ | |
| eth_getTransactionByHash | ✅ |  |
| eth_getTransactionReceipt | ✅ |  |
| eth_getLogs | ✅ | |
| eth_getBlockByHash | ✅ |  |
| eth_getBlockByNumber | ✅ | |
| eth_getBlockTransactionCountByHash | ✅ | |
| eth_getBlockTransactionCountByNumber | ✅ | |
| eth_getTransactionByBlockHashAndIndex | ✅ | |
| eth_getTransactionByBlockNumberAndIndex | ✅ | |
| web3_sha3 | ✅ | |
| eth_syncing | 🚧 |  |
| eth_hashrate | ❌ |  |
| eth_coinbase | 🚧 |  |
| eth_mining | 🚧 |  |
| eth_maxPriorityFeePerGas | 🚧 |  |
| eth_accounts | ✅ |  |
| eth_submitHashrate | ❌ |  |
| eth_getUncleByBlockHashAndIndex | 🚧 |  |
| eth_getUncleByBlockNumberAndIndex | 🚧 |  |
| eth_getUncleCountByBlockHash | 🚧 |  |
| eth_getUncleCountByBlockNumber | 🚧 |  |
| eth_pendingTransactions | 🚧 | |
| eth_protocolVersion | 🚧      |  |
| eth_feeHistory | 🚧 | |
| eth_getFilterChanges | 🚧 |  |
| eth_getFilterLogs | 🚧 |  |
| eth_newBlockFilter | 🚧 |  |
| eth_newFilter | 🚧 |  |
| eth_newPendingTransactionFilter | 🚧 |  |
| eth_uninstallFilter | 🚧 |  |
| net_listening | ❌ | |
| net_peerCount | ❌ | |
| eth_compileLLL | ❌ | |
| eth_compileSerpent | ❌ | |
| eth_compileSolidity | ❌ | |
| eth_getCompilers | ❌ | |
| eth_getProof | ❌ | EIP-1186 |
| eth_getWork | ❌ | |
| db_* | ❌ | |
| shh_* | ❌ | |

Legend: ❌ = not supported. 🚧 = work in progress. ✅ = supported.

### Address

In Conflux Core Space all EOA accounts address starts with `0x1`, all contract address starts with `0x8`.
And the contract address computation is different from ETH.

### Transaction

In Conflux Core Space the [transaction fields, encode and sign method](https://developer.confluxnetwork.org/sending-tx/en/transaction_explain) is different from ETH.

For SDKs and tools to work this bridge the transaction assemble and sign process need to update.


#### Notes

* `eth_sendRawTransaction` only accept 155 transaction, `1559`, `2930` is not supported
* Methods not listed here are also not supported.
* There is no concept of uncle (aka ommer) blocks. The `eth_getUncleByBlockHashAndIndex` and `eth_getUncleByBlockNumberAndIndex` methods always return `null`. The `eth_getUncleCountByBlockHash` and `eth_getUncleCountByBlockNumber` methods return zero for valid block IDs and `null` for invalid block IDs. Additionally, uncle-related block metadata such as `sha3Uncles` is sha3 of empty hash array.
* The nonstandard Geth tracing APIs are not supported at present
* The nonstandard Parity tracing APIs are in progress

### `pending` tag

Only `eth_getTransactionCount` method has supported `pending` tag. Other method will treat `pending` tag as `latest`

* eth_getTransactionCount ✅
* eth_getBalance
* eth_getCode
* eth_getStorageAt
* eth_call

Note: filter related methods also not support `pending` tag

### Data verifiability

Below fields can not guarantee the verifiability

#### Block

* hash
* stateRoot
* receiptsRoot
* transactionsRoot
* totalDifficulty

#### Receipt

* logsBloom

### pub/sub

Not supported