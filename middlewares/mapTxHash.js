const { createAsyncMiddleware } = require('json-rpc-engine');
const { ethers } = require('ethers');

module.exports = function() {
  const _hashMap = {};
  return createAsyncMiddleware(async (req, res, next) => {
    const { method } = req;
    // update hash
    if (method === 'eth_getTransactionByHash' || method === 'eth_getTransactionReceipt') {
      const _hash = req.params[0];
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
    if (isSendRawTxMethod && res.result) {
      console.log('Mapping hash: ', hash, res.result);
      _hashMap[hash] = res.result;
      // if client check server's response hash with it's local computed hash, the next line code comment should be open
      // res.result = hash;   
    }
  });
}