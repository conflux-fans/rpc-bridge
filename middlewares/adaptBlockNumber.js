const { createAsyncMiddleware } = require('json-rpc-engine');
module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    const { method } = req;
    if (method === 'eth_getBlockByNumber' && req.params[0] === 'latest') {
        req.params[0] = 'safe';
    }
    await next();
  })
}