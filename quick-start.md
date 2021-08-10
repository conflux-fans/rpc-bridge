# Conflux RPC-bridge 服务使用

Conflux RPC-bridge 服务可以将 Conflux 的 RPC 方法 bridge 成以太坊 RPC，意味着可以直接使用以太坊的工具，SDK，钱包来同 Conflux 网络交互。

## What has been adapted ?

### 完成适配的 RPC 方法

目前以太坊的核心方法均已实现适配，具体可参考[这里](https://github.com/conflux-fans/web3-provider-proxy#rpc-methods)

### 需要注意的地方

#### 账户地址

Conflux 地址与以太坊地址并不完全兼容:

1. Conflux 外部账户 hex40 格式的地址均以 `0x1` 开头
2. Conflux 合约地址的 hex40 形式均以 `0x8` 开头
3. 内置合约地址的 hex40 格式均以 `0x0` 开头
4. Conflux 合约地址的生成规则与以太坊不同，地址计算过程中引入了 blockNumber，无法提前计算出来，需要从 Transaction Receipt 获取

**重要**: 鉴于两个网络地址的区别，在使用 RPC-bridge 过程中, **切记** 不能向非 `0x1` 开头的地址转账，不能同非 `0x8` 合约地址交互。

以下情况 RPC-bridge 服务会直接拒绝并返回失败：

1. 发送的交易 recover 出来地址的首位非 `0x1`
2. 交易的目标地址非 `0x0`, `0x1`, `0x8`
3. 如果交易是同合约交互，会通过 getCode 方法检查合约是否存在，否则报错
4. 公共的`主网 RPC-bridge` 服务，会对合约地址增加白名单机制，只有通过 Scan 验证的合约，才允许交互 (防止合约交互过程中，错误使用非法 Conflux 地址)


#### 地址格式转换

Conflux 通过 [CIP-37]() 引入了 base32 编码格式的独有地址形式。该格式地址不仅很容易与 hex40 区分，并且地址中包含网络信息，很容易区分主网，测试网地址。

该格式地址能够与 hex40 格式地址相互转换。可使用 [conflux-address-js](https://github.com/conflux-fans/conflux-address-js), 或 Go，Java 的 SDK 进行转换。

Conflux Scan 支持两种格式地址的搜索，并且提供了[转换工具](https://confluxscan.io/address-converter)

#### 交易 hash

`eth_sendRawTransaction` 方法的适配是通过 [CIP-72](https://github.com/Conflux-Chain/CIPs/blob/master/CIPs/cip-72.md) 实现的，适配器需要将以太坊原始交易 decode 出来，然后添加 Conflux 交易所需的 storageLimit 和 epochHeight 信息，并将交易签名的 v 值从以太坊特殊处理还原回来，最终编码为 Conflux 的 rawTransaction。由此带来的问题是交易的 hash 会发生变化。

## 如何使用

### 获取 RPC-bridge 服务地址

因为 [CIP-72](https://github.com/Conflux-Chain/CIPs/blob/master/CIPs/cip-72.md) 需要等下次 HardFork 才会在主网激活，目前需要自行编译 conflux-rust master 分支的最新代码，然后运行一个私链节点并开放 RPC 服务。
然后自行[运行 rpc-bridge 服务](./README.md)。

之后 [Conflux-Docker](https://github.com/conflux-chain/conflux-docker) 会内置集成 rpc-bridge 服务。

并且也将来会提供公共的`主网`，`测试网` bridge 服务。

### 查找以太坊 Conflux 兼容的地址（账户）

由于历史原因 Conflux 将（hex格式）地址按首位划分到不同的命名空间，分别是 `0x0`-内置合约，`0x1`-普通地址，`0x8`-用户创建合约地址。只有以此三个前缀开头的 hex40 地址才是一个合法的 Conflux 地址。
因此如果想使用以太坊生态工具或产品结合 RPC-bridge 与 Conflux 网络交互的话，首先需要找到一个 `0x1` 开头的账户。

可以使用 Conflux 社区开发的[地址查找工具](https://conflux-fans.github.io/web-toolkit/#/address-filter)从助记词中查找 `0x1` 地址的序列号或私钥。
也可以使用 `js-conflux-sdk` 提供的 cli 程序随机生成一个 `0x1` 账户。

```sh
$ cfxjs genEthCMPTaccount
PrivateKey:  0x859c5257bd0190050ed19ba8ee5bc80fdf2fb3044277f9a205bd10957631423e
Address:  0x12002a408e47f9ac6ed11b20c32f59025570078a
```

切记：

1. 进行 CFX 转账，如果转到一个非 `0x1`，`0x8` 地址将会失败。在做转账前请对地址做详细检查
2. 与合约交互，调用合约方法涉及到地址的地方同样需要确保使用一个 `0x1` 开头的地址。如果使用 web3.js 或 ethers.js 开发 Conflux Dapp，开发者需要在 Dapp 中涉及到地址的地方，对地址进行检查，阻止使用非法地址

### 以太坊生态产品

#### web3.js

直接用 RPC-bridge url 初始化 Web3 对象即可

#### ethers.js

使用 ether.js 同 Conflux RPC-bridge 服务交互有几个地方需要注意：

1. 发送交易时 RPC-bridge 返回的交易 hash，同 SDK 计算的 hash 不一致，SDK 会做检查。所以需要使用定制版的 ethers.js
2. Conflux 的合约地址生成规则同以太坊有很大差别，所以 ethers.js 自行计算的合约地址同部署后 Conflux 链上最终的实际合约地址不一致。所以需要等部署交易执行后获取 Receipt 中的合约地址，并设置 ethers 合约对象实例的地址属性。参考代码如下：

```js
let factory = new ethers.ContractFactory(abi, bytecode, wallet);
let contract = await factory.deploy();
let receipt = await contract.deployTransaction.wait();
contract = contract.attach(receipt.contractAddress);
// interact with the contract object
let balance = await contract.balanceOf(wallet.address);
console.log(ethers.utils.formatEther(balance));
```

#### Truffle
使用 Truffle 开发 Conflux 合约的话，同样需要使用 `0x1` 开头的账户，需要在 `truffle-config.js` 中使用 `HDWalletProvider` 配置地址以 `0x1` 开头的账户私钥，以及 RPC-bridge 服务地址。
可参考如下代码：

```js
networks: {
  development: {
    network_id: "*",       // Any network (default: none)
    provider: function() {
      return new HDWalletProvider({
        privateKeys: ['0x848decfce5275f85de1608632f8cf71c739bff6084462f12471eabfd00000000'],
        providerOrUrl: "http://127.0.0.1:8545"  // this is the RPC-bridge url
      });
    },
  }
}
```

#### MetaMask

使用 MetaMask 同 Conflux 交互需要：

1. 将 RPC-bridge 地址添加到 MetaMask 网络中
2. 找到或导入一个 `0x1` 开头的地址，只有 `0x1` 开头的地址才能同 Conflux 网络交互

**NOTE:** 转账时切记检查收款地址是否为一个合法的 Conflux 地址，否则转账会失败。

**NOTE:** Portal 的私钥导入到 Metamask 之后，无法直接使用

#### Hardhat

TODO

