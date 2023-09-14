const { createAsyncMiddleware } = require('json-rpc-engine');

module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    const { method } = req;
    // adapt default block number tag to safe
    if (method === 'eth_getBlockByNumber' && (req.params[0] === 'latest' || req.params.length === 0)) {
        req.params[0] = 'safe';
    }
    await next();
  })
}