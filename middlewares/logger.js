const { createAsyncMiddleware } = require('json-rpc-engine');
const IGNORE_METHODS = [
  'eth_getBalance',
  'eth_getBlockByNumber',
  'eth_blockNumber'
];
module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    await next();
    if (IGNORE_METHODS.indexOf(req.method) > -1) return;
    console.log({
      method: req.method,
      params: req.params,
      result: res.result,
      error: res.error,
    });
  })
}