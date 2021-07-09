const { createAsyncMiddleware } = require('json-rpc-engine');
module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    await next();
    // if (req.method == 'eth_getBalance') return;
    console.log({
      method: req.method,
      params: req.params,
      result: res.result,
      error: res.error,
    });
  })
}