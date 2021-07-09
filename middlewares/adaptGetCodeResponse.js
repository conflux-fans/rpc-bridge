const { createAsyncMiddleware } = require('json-rpc-engine');
module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    const { method } = req;
    await next();
    if(method === 'eth_getCode' && res.error) {
      delete res.error;
      res.result = '0x';
    }
  })
}