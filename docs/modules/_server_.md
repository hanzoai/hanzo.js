[@hanzo/matching-engine](../README.md) › [Globals](../globals.md) › ["server"](_server_.md)

# External module: "server"

## Index

### Variables

* [app](_server_.md#const-app)
* [books](_server_.md#const-books)
* [candleTrees](_server_.md#const-candletrees)
* [exp](_server_.md#const-exp)
* [http](_server_.md#const-http)
* [nrm](_server_.md#const-nrm)
* [port](_server_.md#const-port)

### Functions

* [createBook](_server_.md#const-createbook)

## Variables

### `Const` app

• **app**: *Express‹›* =  createHttp(books, candleTrees)

*Defined in [server.ts:98](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/server.ts#L98)*

___

### `Const` books

• **books**: *Map‹string, [Book](../classes/_book_.book.md)‹››* =  new Map<string, Book>()

*Defined in [server.ts:14](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/server.ts#L14)*

___

### `Const` candleTrees

• **candleTrees**: *Map‹string, Map‹[CandleInterval](../enums/_candle_.candleinterval.md), [CandleAVL](../classes/_candle_.candleavl.md)‹›››* =  new Map<string,Map<CandleInterval, CandleAVL>>()

*Defined in [server.ts:15](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/server.ts#L15)*

___

### `Const` exp

• **exp**: *function* =  random.exponential(1)

*Defined in [server.ts:10](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/server.ts#L10)*

#### Type declaration:

▸ (): *number*

___

### `Const` http

• **http**: *any* =  createSocketIO(books, candleTrees, app, createBook)

*Defined in [server.ts:102](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/server.ts#L102)*

___

### `Const` nrm

• **nrm**: *function* =  random.normal(1, 1)

*Defined in [server.ts:11](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/server.ts#L11)*

#### Type declaration:

▸ (): *number*

___

### `Const` port

• **port**: *4000* = 4000

*Defined in [server.ts:100](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/server.ts#L100)*

## Functions

### `Const` createBook

▸ **createBook**(`name`: string): *undefined | [Book](../classes/_book_.book.md)‹›*

*Defined in [server.ts:17](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/server.ts#L17)*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *undefined | [Book](../classes/_book_.book.md)‹›*
