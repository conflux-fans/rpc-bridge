const { createAsyncMiddleware } = require('json-rpc-engine');
module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    await next();
    if(req.method === 'eth_getCode' && res.error) {
      delete res.error;
      res.result = '0x';
    }
  })
}