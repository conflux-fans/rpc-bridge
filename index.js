const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { JsonRpcEngine } = require('json-rpc-engine');
const { Conflux } = require('js-conflux-sdk');
const utils = require('./utils');

const CONFIG = require('./config.json');
const CFXProvider = require('./middlewares/cfxProvider');
const cfxAddressIfy = require('./middlewares/cfxAddressIfy');
const jsonrpcLogger = require('./middlewares/logger');
const adaptGasPrice = require('./middlewares/adaptGasPrice');
// const ETHProvider = require('./middlewares/ethProvider');
// const mapTxHash = require('./middlewares/mapTxHash');

async function startApp() {
  const networkId = await getNetworkId(CONFIG.url);
  if (!networkId) {
    console.log('Can not connect to Conflux RPC');
    return;
  };
  const engine = getMiddlewareEngine(CONFIG.url, networkId);

  const app = new Koa();
  app.use(bodyParser());
  app.use(async ctx => {
    const { body } = ctx.request;
    ctx.assert(body, 401, 'Invalid JSON RPC request');
    ctx.body = await engine.handle(body);
  });

  app.on('error', err => {
    console.error('server error', err);
  });

  console.log('******** Starting the RPC-bridge server ********');
  app.listen(CONFIG.port);
}

function getMiddlewareEngine(url, networkId) {
  let engine = new JsonRpcEngine();
  engine.push(adaptGasPrice());
  engine.push(jsonrpcLogger());
  engine.push(cfxAddressIfy());
  // engine.push(adaptGetCodeResponse());
  // engine.push(mapTxHash());
  engine.push(CFXProvider({url, networkId}));
  // engine.push(ETHProvider({url: 'http://localhost:7585'}))
  return engine;
}

async function getNetworkId(url) {
  const cfx = new Conflux({url});
  let networkId
  let n = 10;
  while(!networkId && n > 0) {
    try {
      const status = await cfx.getStatus();
      networkId = status.networkId;
    } catch(err) {
      console.log('******** Retry to get networkId');
      await utils.waitNS(5);
    }
    n--;
  }

  return networkId;
}

startApp().catch(console.log);