const { createAsyncMiddleware } = require('json-rpc-engine');
module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    await next();
    console.log({
      method: req.method,
      params: req.params,
      result: res.result,
      error: res.error,
    });
  })
}