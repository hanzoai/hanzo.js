[@hanzo/matching-engine](../README.md) › [Globals](../globals.md) › ["Candle"](../modules/_candle_.md) › [CandleAVL](_candle_.candleavl.md)

# Class: CandleAVL

a map collection for candles with the same intervals

## Hierarchy

* AVLTree‹number, [Candle](_candle_.candle.md)›

  ↳ **CandleAVL**

## Index

### Constructors

* [constructor](_candle_.candleavl.md#constructor)

### Properties

* [interval](_candle_.candleavl.md#interval)
* [size](_candle_.candleavl.md#size)
* [timeFrame](_candle_.candleavl.md#private-timeframe)

### Methods

* [at](_candle_.candleavl.md#at)
* [clear](_candle_.candleavl.md#clear)
* [contains](_candle_.candleavl.md#contains)
* [destroy](_candle_.candleavl.md#destroy)
* [find](_candle_.candleavl.md#find)
* [forEach](_candle_.candleavl.md#foreach)
* [insert](_candle_.candleavl.md#insert)
* [isBalanced](_candle_.candleavl.md#isbalanced)
* [isEmpty](_candle_.candleavl.md#isempty)
* [keys](_candle_.candleavl.md#keys)
* [load](_candle_.candleavl.md#load)
* [max](_candle_.candleavl.md#max)
* [maxNode](_candle_.candleavl.md#maxnode)
* [min](_candle_.candleavl.md#min)
* [minNode](_candle_.candleavl.md#minnode)
* [next](_candle_.candleavl.md#next)
* [pop](_candle_.candleavl.md#pop)
* [prev](_candle_.candleavl.md#prev)
* [range](_candle_.candleavl.md#range)
* [remove](_candle_.candleavl.md#remove)
* [timeSlice](_candle_.candleavl.md#timeslice)
* [toString](_candle_.candleavl.md#tostring)
* [tradesToCandles](_candle_.candleavl.md#tradestocandles)
* [values](_candle_.candleavl.md#values)

## Constructors

###  constructor

\+ **new CandleAVL**(`interval`: [CandleInterval](../enums/_candle_.candleinterval.md)): *[CandleAVL](_candle_.candleavl.md)*

*Overrides void*

*Defined in [Candle.ts:22](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Candle.ts#L22)*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`interval` | [CandleInterval](../enums/_candle_.candleinterval.md) | candle interval for children  |

**Returns:** *[CandleAVL](_candle_.candleavl.md)*

## Properties

###  interval

• **interval**: *[CandleInterval](../enums/_candle_.candleinterval.md)*

*Defined in [Candle.ts:21](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Candle.ts#L21)*

___

###  size

• **size**: *number*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:15

___

### `Private` timeFrame

• **timeFrame**: *string*

*Defined in [Candle.ts:22](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Candle.ts#L22)*

## Methods

###  at

▸ **at**(`index`: number): *Node‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:19

**Parameters:**

Name | Type |
------ | ------ |
`index` | number |

**Returns:** *Node‹number, [Candle](_candle_.candle.md)›*

___

###  clear

▸ **clear**(): *AVLTree‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:37

**Returns:** *AVLTree‹number, [Candle](_candle_.candle.md)›*

___

###  contains

▸ **contains**(`key`: number): *boolean*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:20

**Parameters:**

Name | Type |
------ | ------ |
`key` | number |

**Returns:** *boolean*

___

###  destroy

▸ **destroy**(): *AVLTree‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:36

**Returns:** *AVLTree‹number, [Candle](_candle_.candle.md)›*

___

###  find

▸ **find**(`key`: number): *Node‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:18

**Parameters:**

Name | Type |
------ | ------ |
`key` | number |

**Returns:** *Node‹number, [Candle](_candle_.candle.md)›*

___

###  forEach

▸ **forEach**(`callback`: ForEachCallback‹number, [Candle](_candle_.candle.md)›): *AVLTree‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:29

**Parameters:**

Name | Type |
------ | ------ |
`callback` | ForEachCallback‹number, [Candle](_candle_.candle.md)› |

**Returns:** *AVLTree‹number, [Candle](_candle_.candle.md)›*

___

###  insert

▸ **insert**(`key`: number, `data?`: Value): *void*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:16

**Parameters:**

Name | Type |
------ | ------ |
`key` | number |
`data?` | Value |

**Returns:** *void*

___

###  isBalanced

▸ **isBalanced**(): *boolean*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:34

**Returns:** *boolean*

___

###  isEmpty

▸ **isEmpty**(): *boolean*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:21

**Returns:** *boolean*

___

###  keys

▸ **keys**(): *Array‹number›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:22

**Returns:** *Array‹number›*

___

###  load

▸ **load**(`keys`: Array‹number›, `values?`: Array‹[Candle](_candle_.candle.md)›): *AVLTree‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:31

**Parameters:**

Name | Type |
------ | ------ |
`keys` | Array‹number› |
`values?` | Array‹[Candle](_candle_.candle.md)› |

**Returns:** *AVLTree‹number, [Candle](_candle_.candle.md)›*

___

###  max

▸ **max**(): *number*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:26

**Returns:** *number*

___

###  maxNode

▸ **maxNode**(): *Node‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:28

**Returns:** *Node‹number, [Candle](_candle_.candle.md)›*

___

###  min

▸ **min**(): *number*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:25

**Returns:** *number*

___

###  minNode

▸ **minNode**(): *Node‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:27

**Returns:** *Node‹number, [Candle](_candle_.candle.md)›*

___

###  next

▸ **next**(`node`: Node‹number, [Candle](_candle_.candle.md)›): *Node‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:33

**Parameters:**

Name | Type |
------ | ------ |
`node` | Node‹number, [Candle](_candle_.candle.md)› |

**Returns:** *Node‹number, [Candle](_candle_.candle.md)›*

___

###  pop

▸ **pop**(): *Node‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:24

**Returns:** *Node‹number, [Candle](_candle_.candle.md)›*

___

###  prev

▸ **prev**(`node`: Node‹number, [Candle](_candle_.candle.md)›): *Node‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:32

**Parameters:**

Name | Type |
------ | ------ |
`node` | Node‹number, [Candle](_candle_.candle.md)› |

**Returns:** *Node‹number, [Candle](_candle_.candle.md)›*

___

###  range

▸ **range**(`minKey`: number, `maxKey`: number, `visit`: TraverseCallback‹number, [Candle](_candle_.candle.md)›, `context?`: any): *AVLTree‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:30

**Parameters:**

Name | Type |
------ | ------ |
`minKey` | number |
`maxKey` | number |
`visit` | TraverseCallback‹number, [Candle](_candle_.candle.md)› |
`context?` | any |

**Returns:** *AVLTree‹number, [Candle](_candle_.candle.md)›*

___

###  remove

▸ **remove**(`key`: number): *Node‹number, [Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:17

**Parameters:**

Name | Type |
------ | ------ |
`key` | number |

**Returns:** *Node‹number, [Candle](_candle_.candle.md)›*

___

###  timeSlice

▸ **timeSlice**(`startTime`: number, `endTime`: number, `limit`: number): *[Candle](_candle_.candle.md)[]*

*Defined in [Candle.ts:65](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Candle.ts#L65)*

returns the candles withing a certain time range

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`startTime` | number | - | lower time bound |
`endTime` | number | - | higher time bound |
`limit` | number | 1000 | - |

**Returns:** *[Candle](_candle_.candle.md)[]*

an array of candles

___

###  toString

▸ **toString**(): *string*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:35

**Returns:** *string*

___

###  tradesToCandles

▸ **tradesToCandles**(`trades`: [Trade](_trade_.trade.md)[]): *[CandleAVL](_candle_.candleavl.md)*

*Defined in [Candle.ts:42](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Candle.ts#L42)*

process trades into candles

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`trades` | [Trade](_trade_.trade.md)[] | a list of trades to turn into candles |

**Returns:** *[CandleAVL](_candle_.candleavl.md)*

return this to make it chainable

___

###  values

▸ **values**(): *Array‹[Candle](_candle_.candle.md)›*

*Inherited from void*

Defined in /home/groot/matching-engine/node_modules/avl/src/index.d.ts:23

**Returns:** *Array‹[Candle](_candle_.candle.md)›*
