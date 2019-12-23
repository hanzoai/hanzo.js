[@hanzo/matching-engine](../README.md) › [Globals](../globals.md) › ["Book"](../modules/_book_.md) › [Book](_book_.book.md)

# Class: Book

order book for keeping track of and settling orders

## Hierarchy

* **Book**

## Index

### Constructors

* [constructor](_book_.book.md#constructor)

### Properties

* [_meanPrice](_book_.book.md#private-_meanprice)
* [_orderBook](_book_.book.md#private-_orderbook)
* [activeOrders](_book_.book.md#activeorders)
* [asks](_book_.book.md#asks)
* [bids](_book_.book.md#bids)
* [id](_book_.book.md#id)
* [name](_book_.book.md#name)
* [pendingOrderBook](_book_.book.md#pendingorderbook)

### Accessors

* [askSize](_book_.book.md#asksize)
* [bidSize](_book_.book.md#bidsize)
* [meanPrice](_book_.book.md#meanprice)
* [orderBook](_book_.book.md#orderbook)
* [spread](_book_.book.md#spread)

### Methods

* [addOrder](_book_.book.md#addorder)
* [addToPendingOrderBook](_book_.book.md#addtopendingorderbook)
* [cancelOrder](_book_.book.md#cancelorder)
* [nearestAsk](_book_.book.md#nearestask)
* [nearestBid](_book_.book.md#nearestbid)
* [settle](_book_.book.md#settle)
* [start](_book_.book.md#start)

### Object literals

* [_renderedOrderBook](_book_.book.md#private-_renderedorderbook)

## Constructors

###  constructor

\+ **new Book**(`name`: string): *[Book](_book_.book.md)*

*Defined in [Book.ts:129](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L129)*

order constructor

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`name` | string | name of this book  |

**Returns:** *[Book](_book_.book.md)*

## Properties

### `Private` _meanPrice

• **_meanPrice**: *Decimal* =  new Decimal(0)

*Defined in [Book.ts:119](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L119)*

cached mean price, can only safely be taken after a settle

___

### `Private` _orderBook

• **_orderBook**: *[OrderBookTree](../modules/_book_.md#orderbooktree)* =  new AVLTree<string, Decimal>(naturalOrderCollator.compare)

*Defined in [Book.ts:106](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L106)*

this keeps track of the current orderbook as a map of prices to volumes

___

###  activeOrders

• **activeOrders**: *[OrderMap](../modules/_book_.md#ordermap)* =  new Map<string, Order>()

*Defined in [Book.ts:129](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L129)*

this keeps track of all the orders so updating status and cancellation is
easier

___

###  asks

• **asks**: *[OrderHeap](../modules/_book_.md#orderheap)* =  new FibonacciHeap<Order>(askComparator)

*Defined in [Book.ts:96](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L96)*

ask heap

___

###  bids

• **bids**: *[OrderHeap](../modules/_book_.md#orderheap)* =  new FibonacciHeap<Order>(bidComparator)

*Defined in [Book.ts:101](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L101)*

bid heap

___

###  id

• **id**: *string* =  uuid.v4()

*Defined in [Book.ts:85](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L85)*

unique book id

___

###  name

• **name**: *string*

*Defined in [Book.ts:91](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L91)*

string identifier for book (generally something simple like the trading
pair)

___

###  pendingOrderBook

• **pendingOrderBook**: *[OrderBookMap](../modules/_book_.md#orderbookmap)* =  new Map<string, Decimal>()

*Defined in [Book.ts:123](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L123)*

this is a list of pending orders that is merged into the existing orderbook on settle

## Accessors

###  askSize

• **get askSize**(): *number*

*Defined in [Book.ts:144](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L144)*

get the number of asks, note cancelled but unsettled orders are only
periodically removed

**Returns:** *number*

returns number of asks

___

###  bidSize

• **get bidSize**(): *number*

*Defined in [Book.ts:153](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L153)*

get the number of bids, note cancelled but unsettled orders are only
periodically removed

**Returns:** *number*

returns number of bids

___

###  meanPrice

• **get meanPrice**(): *Decimal*

*Defined in [Book.ts:293](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L293)*

**Returns:** *Decimal*

___

###  orderBook

• **get orderBook**(): *[OrderBook](../interfaces/_book_.orderbook.md)*

*Defined in [Book.ts:198](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L198)*

**Returns:** *[OrderBook](../interfaces/_book_.orderbook.md)*

returns the current orderbook (readonly)

___

###  spread

• **get spread**(): *Decimal*

*Defined in [Book.ts:289](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L289)*

**Returns:** *Decimal*

return the spread between bid and asks or Infinity if less than 2
limit orders

## Methods

###  addOrder

▸ **addOrder**(`order`: [Order](_order_.order.md)): *boolean*

*Defined in [Book.ts:220](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L220)*

Insert an order into the order book

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`order` | [Order](_order_.order.md) | order to add or throw an error  |

**Returns:** *boolean*

___

###  addToPendingOrderBook

▸ **addToPendingOrderBook**(`price`: Decimal, `quantity`: Decimal): *void*

*Defined in [Book.ts:207](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L207)*

modify the pending order book, skip 0s

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`price` | Decimal | price to add the quantity to |
`quantity` | Decimal | quantity to add to pending order book  |

**Returns:** *void*

___

###  cancelOrder

▸ **cancelOrder**(`order`: [Order](_order_.order.md)): *boolean*

*Defined in [Book.ts:272](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L272)*

cancel an order if it exists

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`order` | [Order](_order_.order.md) | order to cancel  |

**Returns:** *boolean*

___

###  nearestAsk

▸ **nearestAsk**(): *[Order](_order_.order.md) | undefined*

*Defined in [Book.ts:160](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L160)*

**Returns:** *[Order](_order_.order.md) | undefined*

returns the nearest ask order

___

###  nearestBid

▸ **nearestBid**(): *[Order](_order_.order.md) | undefined*

*Defined in [Book.ts:179](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L179)*

**Returns:** *[Order](_order_.order.md) | undefined*

returns the nearest bid order

___

###  settle

▸ **settle**(): *[Trade](_trade_.trade.md)[]*

*Defined in [Book.ts:300](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L300)*

settle the order book by executing overlapping trades

**Returns:** *[Trade](_trade_.trade.md)[]*

___

###  start

▸ **start**(`settleFn`: function): *[ExecutionContext](../interfaces/_book_.executioncontext.md)*

*Defined in [Book.ts:493](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L493)*

start executing settle repeatedly, only run once

**Parameters:**

▪`Default value`  **settleFn**: *function*=  () => {}

function that executes with the return value of settle

▸ (`b`: [Book](_book_.book.md), `t`: [Trade](_trade_.trade.md)[]): *void*

**Parameters:**

Name | Type |
------ | ------ |
`b` | [Book](_book_.book.md) |
`t` | [Trade](_trade_.trade.md)[] |

**Returns:** *[ExecutionContext](../interfaces/_book_.executioncontext.md)*

return an ExecutionContext with a stop function

## Object literals

### `Private` _renderedOrderBook

### ▪ **_renderedOrderBook**: *object*

*Defined in [Book.ts:111](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L111)*

this keeps track of the rendered orderbook

###  asks

• **asks**: *never[]* =  []

*Defined in [Book.ts:113](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L113)*

###  bids

• **bids**: *never[]* =  []

*Defined in [Book.ts:112](https://github.com/hanzoai/matching-engine/blob/e02ef88/src/Book.ts#L112)*
