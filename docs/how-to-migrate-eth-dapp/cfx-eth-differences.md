# Conflux 与 Ethereum 的区别

## 账本结构

为了提高交易的处理速度，Conflux 采用了 DAG 形式的账本结构，允许网络并行出块。
并创新性的加入了引用边从而实现交易的全排序，从而能够支持智能合约。
我们将 `DAG + 引用边` 这种结构称之为`树图`。
交易排序需要先通过 GHAST (GHOST 协议改进而来) 的最重子树规则确定一条 `Pivot chain`。
Pivot chain 的每个 block 被定义为一个 `Epoch`, 每个 Epoch 都有一个 `EpochNumber`。
非 Pivot chain 上的 block 会按照一定的规则，划分到 Epoch 中。
Conflux 的账本结构及共识的详细介绍参考[这篇介绍](https://confluxnetwork.org/files/Conflux_Technical_Presentation_20200309.pdf) 

![](https://developer.confluxnetwork.org/img/tree_graph.jpg)

需要注意的几点：

1. 一个 Epoch 中可能会有多个 block
2. 一个 TX 可能会被到多个 block 打包，交易只会在第一个被打包的区块中执行，其他区块中的该交易不会被执行

## 地址

Conflux 通过 `CIP-37` 引入了一种 `base32 编码`的地址格式。该格式地址除了带有`地址信息`外，还包含`网络前缀`，`地址类型`（可选），`校验和`。

```js
// 普通主网地址
// cfx:aap48z6vu4c0fumef3sypmx36gzf02bpjupd54v7ba
// verbose 格式地址
// CFX:TYPE.USER:AAP48Z6VU4C0FUMEF3SYPMX36GZF02BPJUPD54V7BA
// 测试网地址
// cfxtest:aap48z6vu4c0fumef3sypmx36gzf02bpjugjjm11fm
```

从 `conflux-rust v1.1.1` 开始，此种格式地址成为了 Conflux 网络的默认地址格式。

在 CIP-37 之前，Conflux 使用与以太坊相同的 `hex40` 格式地址。

```js
// 普通地址
// 0x19af5791868562c1442e5d462a79e1aa5b602c44   
// with checksum
// 0x19aF5791868562c1442E5D462a79e1AA5b602c44
```

但需要注意的是 Conflux 对 hex40 格式地址增加了一些**限制**，只有固定前缀的 hex40 地址，才是有效地址。

* 普通外部账户地址: `0x1` 前缀开头
* 合约地址: `0x8` 前缀开头
* 内置合约地址: `0x0` 前缀开头

另外:

1. CIP37 地址和 hex40 格式地址可以相互转换

## EVM

Conflux 的 VM 由 EVM 移植而来，做了一些增强和优化，大部分的以太坊智能合约可以直接移植到 Conflux 部署。
CVM 和 EVM 的区别如下：

### 用户部署合约的 hex40 地址均以 `0x8` 开头

以太坊合约迁移至 Conflux 的时候，需要检查合约里有没有硬编码以太坊的相关地址

### Conflux 链的 1820 合约地址不同

Conflux 链上的 1820 合约的地址为： `0x88887eD889e776bCBe2f0f9932EcFaBcDfCd1820`

### 重入关闭

Conflux 链为了避免重入攻击，默认关闭了合约的重入行为。如果用户的确需要打开，可通过内置合约进行设置。

### 区块高度和区块哈希相关的指令

在以太坊中，`BLOCKHASH (0x40)` 指令 （Solidity 中的 `block.blockhash(n)` 函数) 接受区块编号(区块高度) n 作为输入，输出区块高度对应的哈希值。其中参数高度 n 与交易执行时所在区块高度相差不可以超过 256，否则会返回 0.

Conflux 采用了树图结构，当区块排序后，每一个区块会产生一个`排序编号`，这个排序编号与区块高度`可能不同`。因为树图结构排序后，相邻的两个区块`可能没有父子关系`，所以编号为 n-1 的区块不一定是编号为 n 区块的父亲区块。

Conflux 中 `BLOCKHASH (0x40)` 指令 （Solidity 中的 `block.blockhash(n)` 函数）接受区块排序编号 n 作为输入。相应的，`NUMBER (0x43)` 指令（Solidity 中的 `block.number` 变量）得到的也是排序编号。

此外，以太坊的 `BLOCKHASH (0x40)` 指令可以询问交易所在区块前 `256` 个区块的哈希值，而 Conflux 的指令只能询问`前一个`区块的哈希值。但是，Conflux 的参数数量和以太坊没有区别。

### 出块速度

Conflux 的出块速度是每秒 2 个块，比以太坊快很多。如果智能合约的代码逻辑里硬编码了出块速度，需要作出相应的改变。

### 其他区别

* 合约创建后，创建者（即合约创建时的 msg.sender）自动成为合约的管理员。管理员有权销毁合约，或转移管理员权限给他人。管理员可以是普通地址，也可以是合约地址
* Conflux 中有存储押金和赞助商机制，但不影响合约代码迁移


## 参考
* [Conflux的 CVM 和 EVM 虚拟机层的主要区别](https://juejin.cn/post/6854573220268343309)
