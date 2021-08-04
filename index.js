const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { JsonRpcEngine } = require('json-rpc-engine');
const { Conflux } = require('js-conflux-sdk');

const CONFIG = require('./config.json');
const CFXProvider = require('./middlewares/cfxProvider');
const cfxAddressIfy = require('./middlewares/cfxAddressIfy');
const jsonrpcLogger = require('./middlewares/logger');
const adaptGasPrice = require('./middlewares/adaptGasPrice');
// const ETHProvider = require('./middlewares/ethProvider');
// const mapTxHash = require('./middlewares/mapTxHash');
// const adaptGetCodeResponse = require('./middlewares/adaptGetCodeResponse');


async function startApp() {
  const cfx = new Conflux(CONFIG);
  const { networkId } = await cfx.getStatus();
  const engine = createMiddlewareEngine(CONFIG.url, networkId);

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

  app.listen(CONFIG.port);
}

function createMiddlewareEngine(url, networkId) {
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

startApp().catch(console.log);