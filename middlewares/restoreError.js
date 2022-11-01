const { createAsyncMiddleware } = require('json-rpc-engine');

module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    await next();
    if (res._error) {
      const error = res._error;
      delete res._error;
      delete res.result;
      res.error = error;
    }
  })
}