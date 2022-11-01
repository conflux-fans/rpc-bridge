const { Conflux } = require('js-conflux-sdk');
const axios = require('axios').default;

function ethAddressToCfx(address) {
  if(hasCFXAddressNamespace(address)) return address;
  return `0x1${address.toLowerCase().slice(3)}`;
}

function ethContractAddressToCfx(address) {
  if(hasCFXAddressNamespace(address)) return address;
  return `0x8${address.toLowerCase().slice(3)}`;
}

function hasCFXAddressNamespace(address) {
  const namespace = address.slice(0, 3);
  return ['0x0', '0x1', '0x8'].indexOf(namespace) > -1;
}

async function waitNS(number = 30) {
  await new Promise((resolve, _) => {setTimeout(resolve, number * 1000)});
}

function buildJsonRpcRes(data) {
  return Object.assign({
    jsonrpc: '2.0',
  }, data);
}

async function getNetworkId(url) {
  const cfx = new Conflux({url});
  let networkId
  let n = 10;
  while(!networkId && n > 0) {
    try {
      const status = await cfx.getStatus();
      networkId = status.networkId;
    } catch(err) {
      console.log('******** Retry to get networkId');
      await waitNS(5);
    }
    n--;
  }

  return networkId;
}

async function request(req) {
    let response = await axios.post(URL, req)
    return response.data;
}

module.exports = {
  ethAddressToCfx,
  ethContractAddressToCfx,
  waitNS,
  getNetworkId,
  buildJsonRpcRes,
  request
};