const JsonRpcProxy = require('web3-providers-http-proxy');
const { createAsyncMiddleware } = require('json-rpc-engine');

module.exports = function(options) {
  const { url, networkId } = options;
  const cfxProvider = new JsonRpcProxy(url, networkId);

  return createAsyncMiddleware(async (req, res, next) => {
    const { method } = req;
    const _response = await cfxProvider.send(req);
    if (_response.error) {
      // adapt 'eth_getCode' error situation
      if (method !== 'eth_getCode') {
        res.error = _response.error;
      } else {
        res.result = '0x';
      }
    } else {
      res.result = _response.result;
    }
  })
};