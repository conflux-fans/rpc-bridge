# How to migrate Ethereum Dapp to Conflux

## 前端移植

Conflux 的 `RPC-bridge` 服务可以实现兼容以太坊核心 RPC 方法。意味着可以使用 web3.js 或 ethers.js 开发 Dapp 前端。一个现有的以太坊 Dapp 前端做少量改动即可移植到 Conflux 网络来。

### web3.js + MetaMask

如果 Dapp 是由 web3.js 开发，并且还是希望通过 MetaMask 来交互的话，那代码可以不做任何改动，直接将 RPC-bridge 服务地址添加到 MetaMask 中，并切换网络即可。

当然使用 MetaMask 同 Conflux 网络交互，需要先找到一个地址以 `0x1` 开头的账户。

另外建议 Dapp 中涉及到用户填写地址的地方，加上地址 `0x1` 检查，非法地址拒绝用户操作。

### web3.js + Portal

对于前端用 Web3.js 开发的 Dapp，更好的方式是做少量的改动，增加对 Portal 的支持。这样用户可以直接以 Conflux 原生格式地址与 Dapp 交互，更加安全。

```js
// Portal 在浏览中注入的对象为 window.conflux
// 需要进入一个 Adaptor，会将 web3 发起的 eth_sendTransaction 调用适配为 cfx_sendTransaction
// 地址格式处理 getAccount 获取的地址，需要先转换为 hex40 格式
```

如果想为用户提供完美体验，在 Dapp 中显示用户地址时，建议显示 base32 格式的地址，或者两种都显示，允许用户快速切换。

## 合约迁移

Conflux 的 CVM 由 EVM 移植而来，做了很少的增强和优化，大部分的以太坊智能合约可以直接移植到 Conflux 部署。

### 合约地址

Conflux 的合约部署后的地址的 hex40 格式均以 `0x8` 开头。所以如果合约中包含地址的硬编码，需要替换为 Conflux 网络的合约地址。

如果合约使用了 `1820 registry` 合约，需要替换为 `0x88887eD889e776bCBe2f0f9932EcFaBcDfCd1820`

### 重入

重入行为在 Conflux VM 中是默认关闭的，如果合约中存在`重入操作`，需要通过内置合约手动打开。

### block.number

在 Conflux 中 `block.number` 获取的是树图账本中区块的（全）排序编号，不是 `epochNumber`


## 其他

### personal_sign & typedDataSign


