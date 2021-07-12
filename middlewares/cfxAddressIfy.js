const { createAsyncMiddleware } = require('json-rpc-engine');
const utils = require('../utils');

module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    const { method } = req;
    if(method === 'eth_getBalance' || method === 'eth_getTransactionCount') {
      req.params[0] = utils.ethAddressToCfx(req.params[0]);
    }
    await next();
  })
}