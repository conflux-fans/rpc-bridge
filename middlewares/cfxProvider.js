const JsonRpcProxy = require('web3-providers-http-proxy');
const { createAsyncMiddleware } = require('json-rpc-engine');

module.exports = function(options) {
  const { url } = options;
  const proxyOptions = {respAddressBeHex: true, respTxBeEip155: true};
  const cfxProvider = new JsonRpcProxy(url, proxyOptions);

  return createAsyncMiddleware(async (req, res, next) => {
    const _response = await cfxProvider.asyncSend(req);
    if (_response.error) {
      res._error = _response.error;
      res.result = null;
    } else {
      res.result = _response.result;
    }
  });

};