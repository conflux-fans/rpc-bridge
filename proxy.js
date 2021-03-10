const fs = require('fs');
const path = require('path');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const util = require('util');
const { providerFactory } = require('js-conflux-sdk');

const provider = providerFactory({
  url: "http://127.0.0.1:7545"
});

const app = new Koa();
app.use(bodyParser());

// response
app.use(async ctx => {
  const { body } = ctx.request;
  if (body) {
    const { method, params, id } = body;
    let response;
    try {
      let result = await provider.call(method, ...params);
      response = {
        "jsonrpc": "2.0",
        id,
        result
      };
      await saveJsonRpc(method, params, result);
    } catch (e) {
      response = {
        "jsonrpc": "2.0",
        id,
        "error": { "code": e.code, "message": e.message },
      };
    }
    ctx.body = response;
  } else {
    ctx.body = { "jsonrpc": "2.0", "result": 19, "id": 1 };
  }
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