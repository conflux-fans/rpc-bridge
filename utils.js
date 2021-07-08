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

module.exports = {
  ethAddressToCfx,
  ethContractAddressToCfx,
};