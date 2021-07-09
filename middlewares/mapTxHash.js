const { createAsyncMiddleware } = require('json-rpc-engine');
const { ethers } = require('ethers');

module.exports = function() {
  const _hashMap = {};
  return createAsyncMiddleware(async (req, res, next) => {
    const { method } = req;
    // update hash
    if (method === 'eth_getTransactionByHash' || method === 'eth_getTransactionReceipt') {
      let _hash = req.params[0];
      if (_hashMap[_hash]) {
        req.params[0] = _hashMap[_hash];
      }
    }
    // new hash
    const isSendRawTxMethod = method === 'eth_sendRawTransaction';
    let hash;
    if (isSendRawTxMethod) {
      hash = ethers.utils.keccak256(req.params[0]);
    }
    await next();
    if (isSendRawTxMethod) {
      _hashMap[hash] = res.result;
      res.result = hash;
    }
  });
}