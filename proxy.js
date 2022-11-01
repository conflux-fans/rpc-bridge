const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const util = require('util');
const { providerFactory } = require('js-conflux-sdk');
const debug = require('debug')('rpc-bridge');
const { url: rpc_url } = require('./config.json');

const provider = providerFactory({
  url: rpc_url,
});

const INVALID_REQUEST = { 
    "jsonrpc": "2.0", 
    "error": {"message": "Invalid request"}, 
    "id": 1 
};

const SERVER_ERROR = {
    "jsonrpc": "2.0", 
    "error": {"message": "Internal Server Error"}, 
    "id": 1 
};

const app = new Koa();
app.use(bodyParser());

// response
app.use(async ctx => {
  const { body } = ctx.request;
  if (!body) {
    ctx.body = INVALID_REQUEST;
    return;
  }
  let response = {};
  try {
    response = await util.request(body);
    await saveJsonRpc(method, params, response);  // TODO: move logic to log middleware
  } catch (e) {
    response = Object.assign({id: body.id}, SERVER_ERROR);
  }
  debug({req: body, res: response});
  ctx.body = response;
});

async function saveJsonRpcOneTime(method, params, result) {
  const fileName = path.join(__dirname, `./json-rpc-shots/${method}.json`);
  try {
    await util.promisify(fs.stat)(fileName);
    return;
  } catch(e) {
    let data = {method, params, result};
    await util.promisify(fs.writeFile)(fileName, JSON.stringify(data, null, '\t'));
  }
}

async function saveJsonRpc(method, params, result) {
  const fileName = path.join(__dirname, `./json-rpc-shots/${method}-${Date.now()}.json`);
  delete result.id;
  delete result.jsonrpc;
  let data = {method, params, response: result};
  await util.promisify(fs.writeFile)(fileName, JSON.stringify(data, null, '\t'));
}

const PORT = 3000;
app.listen(PORT, () => {console.log(`Proxy started at ${PORT}`)});
