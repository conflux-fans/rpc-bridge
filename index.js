const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const fs = require('fs');
const path = require('path');
const util = require('util');
const debug = require('debug')('rpc-bridge');
const { HttpProvider, ethToConflux } = require('web3-providers-http-proxy');
const CONFIG = require('./config.json');

const EthBalanceChecker = '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39';
const CfxBalanceChecker = '0x8f35930629fce5b5cf4cd762e71006045bfeb24d';

const app = new Koa();
app.use(bodyParser());

app.use(async ctx => {
  const { body } = ctx.request;
  if (!body) {
    ctx.body = { 
      "jsonrpc": "2.0", 
      "error": {message: 'invalid jsonrpc request', code: -1}, 
      "id": 1 
    };
    return;
  }

  const { method, params, id } = body;
  
  if(method === 'eth_getBalance') {
    params[0] = convertEthAddressToCfx(params[0]);
  }
  // TODO make sure ethereum mainnet and testnet's balanceChecker address is same
  if(method === 'eth_call' && params[0].to === EthBalanceChecker) {
    params[0].to = CfxBalanceChecker;
  }
  
  let response;
  try {
    let result = await send(method, ...params);
    response = result;
    // await saveJsonRpc(method, params, result);
  } catch (e) {
    response = {
      "jsonrpc": "2.0",
      id,
      "error": { "code": e.code, "message": e.message },
    };
  }
  debug('RPC inspect', method, params, response);
  ctx.body = response;
});

const provider = new HttpProvider(CONFIG.url, {
  chainAdaptor: ethToConflux,
  networkId: CONFIG.networkId,
});

const promsieWrapSend = util.promisify(provider.send).bind(provider);

async function send(method, ...params) {
  let payload = buildJsonRpcRequest(method, ...params);
  return await promsieWrapSend(payload);
}

async function saveJsonRpc(method, params, result) {
  const fileName = path.join(__dirname, `./json-rpc-shots/${method}.json`);
  try {
    await util.promisify(fs.stat)(fileName);
  } catch(e) {
    let data = {method, params, result};
    await util.promisify(fs.writeFile)(fileName, JSON.stringify(data, null, '\t'));
  }
}

function buildJsonRpcRequest(method, ...params) {
  return {
    "jsonrpc": "2.0",
    "id": Date.now().toString(),
    method,
    params,
  }
}

function convertEthAddressToCfx(address) {
  return `0x1${address.toLowerCase().slice(3)}`;
}

app.listen(CONFIG.port);