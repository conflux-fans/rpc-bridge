const JsonRpcProxy = require('web3-providers-http-proxy');
const { createAsyncMiddleware } = require('json-rpc-engine');
const { Conflux } = require('js-conflux-sdk');

module.exports = async function(options) {
  const { url } = options;
  const cfx = new Conflux(options);
  const { networkId } = await cfx.getStatus();
  const cfxProvider = new JsonRpcProxy(url, networkId);

  return createAsyncMiddleware(async (req, res, next) => {
    const { method } = req;
    const _response = await cfxProvider.send(req);
    if (_response.error) {
      if (method === 'eth_sendRawTransaction') {
        let {message, data} = _response.error;
        if (data) {
          message += `(${data})`;
        }
        res.error = {
          code: -32000,   // send tx error code
          message: error.message
        };
      } else {
        res.error = _response.error;
      }
    } else {
      res.result = _response.result;
    }
  })
};