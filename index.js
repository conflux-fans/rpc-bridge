const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const getMiddlewareEngine = require('./getMiddlewareEngine');
const CONFIG = require('./config.json');

async function startApp() {
  const engine = await getMiddlewareEngine(CONFIG.url);

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

  app.listen(CONFIG.port, () => console.log(`Server listening at ${CONFIG.port}`));
}

startApp().catch(console.log);