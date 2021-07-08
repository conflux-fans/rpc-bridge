const { createAsyncMiddleware } = require('json-rpc-engine');
const utils = require('../utils');

module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    if(req.method === 'eth_getBalance') {
      req.params[0] = utils.ethAddressToCfx(req.params[0]);
    }
    await next();
  })
}