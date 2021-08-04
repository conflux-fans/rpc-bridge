const { createAsyncMiddleware } = require('json-rpc-engine');
module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    const { method } = req;
    if (method === 'eth_gasPrice') {
      res.result = '0x3b9aca00';   // 1Gwei
      return;
    }
    await next();
  })
}