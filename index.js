const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
// const debug = require('debug')('rpc-bridge');
const CONFIG = require('./config.json');
const { JsonRpcEngine } = require('json-rpc-engine');
const CFXProvider = require('./middlewares/cfxProvider');
const ETHProvider = require('./middlewares/ethProvider');
const cfxAddressIfy = require('./middlewares/cfxAddressIfy');
const adaptGetCodeResponse = require('./middlewares/adaptGetCodeResponse');
const jsonrpcLogger = require('./middlewares/logger');

let engine = new JsonRpcEngine();
engine.push(cfxAddressIfy());
engine.push(adaptGetCodeResponse());
engine.push(jsonrpcLogger());
engine.push(CFXProvider({url: 'http://localhost:12537', networkId: 2}));
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