# cfx-to-eth-rpc-bridge

This is a Conflux-to-ETH RPC bridge

## How to run

To run this service, you need a node that running `conflux-rust`'s newest code.

1. Clone the source code
2. Add a config file: `cp config.json.sample config.json`, and update `url` field in config file to Conflux RPC url.
3. Install dependencies: `npm install`
4. Start the service: `node index.js`

## What has been adapt

### RPC methods

1. gasPrice: 0x3b9aca00 (1G drip)
2. eth_getTransactionCount, eth_getBalance will adapt address

### What to check

1. from, to address should be an valid address
2. If to is an contract address, check whether the contract exist
3. Check contract input data

## TODOs

### Websocket & PubSub

### MetaMask ERC20 balanceChecker address adapt

* Ethereum: 0xb1f8e55c7f64d203c1400b9d8555d050f94adf39
* Conflux: 0x8f35930629fce5b5cf4cd762e71006045bfeb24d