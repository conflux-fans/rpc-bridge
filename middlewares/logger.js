const { createAsyncMiddleware } = require('json-rpc-engine');

const logger = require('../logs/multiLogger')();

const IGNORE_METHODS = [
  'eth_getBalance',
  'eth_getBlockByNumber',
  'eth_blockNumber',
  'eth_call'
];

module.exports = function() {
  return createAsyncMiddleware(async (req, res, next) => {
    await next();
    if (IGNORE_METHODS.indexOf(req.method) > -1) return;
    // if (req.method != 'eth_sendRawTransaction') return;
    const data = {
      id: req.id,
      method: req.method,
      params: req.params,
      result: res.result,
      error: res.error,
    };
    console.log(JSON.stringify({method: data.method, params: data.params}, null, '\t'));
    logger.info(data);
  })
}