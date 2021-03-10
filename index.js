const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const util = require('util');
const {HttpProvider, ethToConflux} = require('web3-providers-http-proxy');

const URL = 'https://testnet-rpc.conflux-chain.org.cn/v2';
const provider = new HttpProvider(URL, {
  chainAdaptor: ethToConflux,
  networkId: 1,
});
const promsieWrapSend = util.promisify(provider.send).bind(provider);

async function send(method, ...params) {
  let payload = buildJsonRpcRequest(method, ...params);
  return await promsieWrapSend(payload);
}

const app = new Koa();
app.use(bodyParser());

// response
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
  ctx.body = response;
});

async function saveJsonRpc(method, params, result) {
  const fileName = path.join(__dirname, `./json-rpc-shots/${method}.json`);
  try {
    await util.promisify(fs.stat)(fileName);
    return;
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

app.listen(3000);