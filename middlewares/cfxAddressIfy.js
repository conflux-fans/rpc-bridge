const { createAsyncMiddleware } = require('json-rpc-engine');
const utils = require('../utils');
const METHODS = [
  'eth_getBalance',
  'eth_getTransactionCount',
  'eth_getStorageAt'
];

module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    const { method } = req;
    if(METHODS.indexOf(method) > -1) {
      req.params[0] = utils.ethAddressToCfx(req.params[0]);
    }
    await next();
  })
}