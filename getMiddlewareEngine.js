const { JsonRpcEngine } = require('json-rpc-engine');
const { getNetworkId } = require('./utils');
const CFXProvider = require('./middlewares/cfxProvider');
const cfxAddressIfy = require('./middlewares/cfxAddressIfy');
const jsonrpcLogger = require('./middlewares/logger');
const adaptGasPrice = require('./middlewares/adaptGasPrice');
// const ETHProvider = require('./middlewares/ethProvider');
// const mapTxHash = require('./middlewares/mapTxHash');

async function getMiddlewareEngine(url) {
  const networkId = await getNetworkId(url);
  if (!networkId) {
    throw new Error("Can't get networkId");
  };

  let engine = new JsonRpcEngine();
  engine.push(adaptGasPrice());
  engine.push(jsonrpcLogger());
  engine.push(cfxAddressIfy());
  // engine.push(mapTxHash());
  engine.push(CFXProvider({url, networkId}));
  // engine.push(ETHProvider({url: 'http://localhost:7585'}))
  return engine;
}

module.exports = getMiddlewareEngine;