const { providerFactory } = require('js-conflux-sdk');
const { createAsyncMiddleware } = require('json-rpc-engine');

module.exports = function(options) {
  const ethProvider = providerFactory(options);

  return createAsyncMiddleware(async (req, res, next) => {
    let _response = await ethProvider.request(req);
    if (_response.error) {
      res.error = _response.error;
    } else {
      res.result = _response.result;
    }
    // await next();
  })
};
