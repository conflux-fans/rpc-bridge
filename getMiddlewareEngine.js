const { JsonRpcEngine } = require('json-rpc-engine');
const { getNetworkId } = require('./utils');
const CFXProvider = require('./middlewares/cfxProvider');
const jsonrpcLogger = require('./middlewares/logger');
const restoreError = require('./middlewares/restoreError');
const adaptBlockNumber = require('./middlewares/adaptBlockNumber');

async function getMiddlewareEngine(url) {
  const networkId = await getNetworkId(url);
  if (!networkId) {
    throw new Error("Can't get networkId");
  };

  let engine = new JsonRpcEngine();
  engine.push(restoreError());
  engine.push(jsonrpcLogger());
//   engine.push(adaptBlockNumber());  // will change blockNumber tag 'latest' to 'safe'
  engine.push(CFXProvider({url, networkId}));
  
  engine.networkId = networkId; // save to use in other place
  return engine;
}

module.exports = getMiddlewareEngine;