const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const util = require('util');
const { providerFactory } = require('js-conflux-sdk');
const debug = require('debug')('rpc-bridge');

const provider = providerFactory({
  url: "http://127.0.0.1:7545",
  // url: "https://rinkeby.infura.io/v3/undefined",
});

const app = new Koa();
app.use(bodyParser());

// response
app.use(async ctx => {
  const { body } = ctx.request;
  if (!body) {
    ctx.body = { 
      "jsonrpc": "2.0", 
      "error": {"message": "Invalid request"}, 
      "id": 1 
    };
    return;
  }
  const { method, params, id } = body;
  let response = {
    "jsonrpc": "2.0",
    id
  };
  try {
    let result = await provider.call(method, ...params);
    response.result = result;
    await saveJsonRpc(method, params, result);
  } catch (e) {
    response.error = { "code": e.code, "message": e.message };
  }
  debug({method, params, result: response.result, error: response.error});
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

app.listen(3000);