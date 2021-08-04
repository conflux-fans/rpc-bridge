const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const CONFIG = require('./config.json');
const { JsonRpcEngine } = require('json-rpc-engine');
const CFXProvider = require('./middlewares/cfxProvider');
const ETHProvider = require('./middlewares/ethProvider');
const cfxAddressIfy = require('./middlewares/cfxAddressIfy');
const adaptGetCodeResponse = require('./middlewares/adaptGetCodeResponse');
const jsonrpcLogger = require('./middlewares/logger');
const mapTxHash = require('./middlewares/mapTxHash');
const adaptGasPrice = require('./middlewares/adaptGasPrice');

let engine = new JsonRpcEngine();
engine.push(adaptGasPrice());
engine.push(jsonrpcLogger());
engine.push(cfxAddressIfy());
// engine.push(adaptGetCodeResponse());
// engine.push(mapTxHash());
engine.push(CFXProvider({url: CONFIG.url, networkId: CONFIG.networkId}));
// engine.push(ETHProvider({url: 'http://localhost:7585'}))

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